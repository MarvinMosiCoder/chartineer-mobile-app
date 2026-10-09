import * as SecureStore from "expo-secure-store";

const sessionKey = "chartineer.session";
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export type AuthUser = { id: string; email: string };
type LoginResponse = { token: string; expiresAt: string; user: AuthUser };

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: object; token?: string } = {},
): Promise<T> {
  if (!apiUrl) throw new Error("Set EXPO_PUBLIC_API_URL and restart Expo.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    if (response.status === 204) return undefined as T;
    const payload: unknown = await response.json();
    if (!response.ok) {
      const message = typeof payload === "object" && payload !== null &&
        "message" in payload && typeof payload.message === "string"
        ? payload.message : "The request failed. Try again.";
      throw new ApiError(message, response.status);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error("Cannot reach the server. Check the backend and emulator connection.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const data = await request<LoginResponse>("/auth/login", {
    method: "POST", body: { email: email.trim(), password },
  });
  try {
    await SecureStore.setItemAsync(sessionKey, data.token);
  } catch {
    // Revoke the new session if storing it on the device fails.
    await request<void>("/auth/logout", { method: "POST", token: data.token }).catch(() => {});
    throw new Error("Could not save your session. Please try again.");
  }
  return data.user;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await SecureStore.getItemAsync(sessionKey);
  if (!token) return null;
  try {
    const data = await request<{ user: AuthUser }>("/auth/me", { token });
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await SecureStore.deleteItemAsync(sessionKey);
      return null;
    }
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const token = await SecureStore.getItemAsync(sessionKey);
  if (token) {
    try {
      await request<void>("/auth/logout", { method: "POST", token });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) throw error;
    }
  }
  await SecureStore.deleteItemAsync(sessionKey);
}