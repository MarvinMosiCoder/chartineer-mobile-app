import {
    getCurrentUser,
    signIn as requestSignIn,
    signOut as requestSignOut,
    type AuthUser,
} from "@/lib/auth";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";
import { AppState } from "react-native";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  refreshSession: (showLoading?: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent session checks, login, and logout from overlapping.
  const sessionBusy = useRef(false);

  const refreshSession = useCallback(async (showLoading = true) => {
    if (sessionBusy.current) return;

    sessionBusy.current = true;

    if (showLoading) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const account = await getCurrentUser();
      setUser(account);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not check your session.",
      );
    } finally {
      sessionBusy.current = false;

      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  async function signIn(email: string, password: string) {
    if (sessionBusy.current) {
      throw new Error(
        "Please wait for the current request to finish.",
      );
    }

    sessionBusy.current = true;

    try {
      const account = await requestSignIn(email, password);
      setUser(account);
      setError(null);
    } finally {
      sessionBusy.current = false;
    }
  }

  async function signOut() {
    if (sessionBusy.current) {
      throw new Error(
        "Please wait for the current request to finish.",
      );
    }

    sessionBusy.current = true;

    try {
      await requestSignOut();
      setUser(null);
      setError(null);
    } finally {
      sessionBusy.current = false;
    }
  }

  // Check the saved session when the provider first mounts.
  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  // Recheck a signed-in user's session when the app resumes.
  useEffect(() => {
    if (!user) return;

    let previousState = AppState.currentState;

    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        const wasAway =
          previousState === "background" ||
          previousState === "inactive";

        previousState = nextState;

        if (wasAway && nextState === "active") {
          void refreshSession(false);
        }
      },
    );

    return () => subscription.remove();
  }, [user, refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        refreshSession,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}