# Build login step by step

You make the application edits and run the commands in this guide. The examples match the existing Expo SDK 55 app, Express 5 API, and `public.users` migration. This guide does not apply those changes automatically.

Work through the steps in order. Paths are relative to the project root unless a command says otherwise.

The flow will be:

1. Create a local test account with a hashed password.
2. Submit email and password to Express.
3. Verify the password and create a PostgreSQL session.
4. Save the session token on Android with SecureStore.
5. Return to Home, restore the session after reopening, and support logout.

Home remains public. Forgot password will need a separate email and reset-token flow; its existing button stays disabled for this lesson.

## 1. Install the two dependencies

From the project root, install the SDK-compatible mobile package:

```powershell
npx expo install expo-secure-store
```

SecureStore is included in Expo Go for Android. These examples also support iOS, but browser authentication needs a separate storage approach. See the [SDK 55 SecureStore documentation](https://docs.expo.dev/versions/v55.0.0/sdk/securestore/).

In the backend terminal:

```powershell
cd backend
npm install express-rate-limit
```

The backend uses Node's built-in `scrypt` for password hashing and `crypto` for random session tokens.

## 2. Create a sessions migration

In the `backend` terminal:

```powershell
npm run migrate -- create create-sessions --migration-file-language sql
```

Open the newly generated `backend/migrations/<timestamp>_create-sessions.sql` and replace its contents with:

```sql
-- Up Migration
CREATE TABLE public.sessions (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sessions_user_id_index ON public.sessions(user_id);
CREATE INDEX sessions_expires_at_index ON public.sessions(expires_at);

-- Down Migration
DROP TABLE public.sessions;
```

Apply it:

```powershell
npm run migrate -- up
```

Keep the original users migration unchanged. A session stores a hash of the token. The app receives the original token and sends it with future requests.

## 3. Add password hashing

Create `backend/passwords.mjs`:

```js
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, 64, options);
  return `scrypt-v1:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof encoded !== "string") return false;
  const [version, saltHex, keyHex, extra] = encoded.split(":");
  if (
    version !== "scrypt-v1" || extra !== undefined ||
    !/^[a-f0-9]{32}$/.test(saltHex ?? "") ||
    !/^[a-f0-9]{128}$/.test(keyHex ?? "")
  ) return false;

  const expected = Buffer.from(keyHex, "hex");
  const actual = await deriveKey(password, Buffer.from(saltHex, "hex"), 64, options);
  return timingSafeEqual(actual, expected);
}
```

Each account receives a random salt. The `scrypt-v1` prefix identifies this exact hashing configuration so a later change can use another version. The settings follow an [OWASP scrypt configuration](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt); the implementation uses [Node's asynchronous crypto API](https://nodejs.org/docs/latest-v24.x/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback).

## 4. Create your first test account

Create `backend/seed-user.mjs`:

```js
import pg from "pg";
import { hashPassword } from "./passwords.mjs";

const email = process.env.SEED_EMAIL?.trim().toLowerCase();
const password = process.env.SEED_PASSWORD;

if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Provide a valid SEED_EMAIL.");
}
if (!password || password.length < 15 || Buffer.byteLength(password, "utf8") > 1024) {
  throw new Error("Use a password with at least 15 characters and at most 1024 bytes.");
}

const pool = new pg.Pool({ connectionTimeoutMillis: 5000 });
try {
  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    `INSERT INTO public.users (email, password_hash)
     VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id`,
    [email, passwordHash],
  );
  console.log(result.rowCount ? "Test account created." : "Account already exists; password unchanged.");
} finally {
  await pool.end();
}
```

Run this in PowerShell from `backend`. Enter the email and password when prompted; use those same credentials in the app. The password is entered through a hidden prompt and removed from this terminal's environment afterward.

```powershell
$env:SEED_EMAIL = Read-Host "Test account email"
$seedPasswordInput = Read-Host "Test account password (15+ characters)" -AsSecureString
try {
  $env:SEED_PASSWORD = [System.Net.NetworkCredential]::new('', $seedPasswordInput).Password
  node --env-file=.env seed-user.mjs
} finally {
  Remove-Item Env:SEED_PASSWORD, Env:SEED_EMAIL -ErrorAction SilentlyContinue
  $seedPasswordInput.Dispose()
}
```

This script creates accounts locally. Repeating it with an existing email does not overwrite that account's password. Never insert a plain password into `password_hash`.

## 5. Add the authentication API

Replace `backend/server.mjs` with:

```js
import cors from "cors";
import express from "express";
import pg from "pg";
import { rateLimit } from "express-rate-limit";
import { createHash, randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "./passwords.mjs";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const pool = new pg.Pool({ connectionTimeoutMillis: 5000 });
const dummyHash = await hashPassword(randomBytes(32).toString("hex"));

pool.on("error", (error) => console.error("Database pool error:", error.message));
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:8081" }));
app.use(express.json({ limit: "10kb" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
});

function readToken(req) {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(req.get("Authorization") ?? "");
  return match?.[1] ?? null;
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.post("/auth/login", loginLimiter, async (req, res) => {
  const emailInput = req.body?.email;
  const password = req.body?.password;
  if (
    typeof emailInput !== "string" || typeof password !== "string" ||
    emailInput.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim()) ||
    password.length === 0 || Buffer.byteLength(password, "utf8") > 1024
  ) return res.status(400).json({ message: "Enter a valid email and password." });

  const email = emailInput.trim().toLowerCase();
  const result = await pool.query(
    `SELECT id::text, email, password_hash FROM public.users
     WHERE LOWER(email) = $1 LIMIT 1`,
    [email],
  );
  const user = result.rows[0];
  // Unknown accounts still perform a password hash comparison.
  const valid = await verifyPassword(password, user?.password_hash ?? dummyHash);
  if (!user || !valid) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    "DELETE FROM public.sessions WHERE user_id = $1 AND expires_at <= NOW()",
    [user.id],
  );
  await pool.query(
    "INSERT INTO public.sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [tokenHash(token), user.id, expiresAt],
  );
  res.set("Cache-Control", "no-store");
  res.json({ token, expiresAt: expiresAt.toISOString(), user: { id: user.id, email: user.email } });
});

app.get("/auth/me", async (req, res) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: "Please sign in." });

  const result = await pool.query(
    `SELECT u.id::text, u.email FROM public.sessions s
     JOIN public.users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [tokenHash(token)],
  );
  if (!result.rows[0]) {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
  res.set("Cache-Control", "no-store");
  res.json({ user: result.rows[0] });
});

app.post("/auth/logout", async (req, res) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: "Please sign in." });
  await pool.query("DELETE FROM public.sessions WHERE token_hash = $1", [tokenHash(token)]);
  res.sendStatus(204);
});

app.use((error, _req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Send a valid JSON request." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request is too large." });
  }
  console.error("API error:", error.message);
  res.status(500).json({ message: "The server could not complete the request. Try again." });
});

app.listen(port, "0.0.0.0", () => console.log(`API running at http://localhost:${port}`));
```

Start or restart the backend:

```powershell
npm run dev
```

The API returns the same incorrect-credentials message for an unknown email and a wrong password. Passwords and password hashes are never returned. Queries use [PostgreSQL parameters](https://node-postgres.com/features/queries) rather than combining user input with SQL.

The [login limiter](https://express-rate-limit.mintlify.app/quickstart/usage) uses memory in this local setup and resets when the API restarts. Sessions expire after seven days; `/auth/me` checks expiration every time. A successful login removes that user's expired session rows.

## 6. Set the Android emulator API address

Create `.env.local` in the **project root**, beside the app's `package.json`:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

`10.0.2.2` is the [Android emulator's address for the development computer](https://developer.android.com/studio/run/emulator-networking-address). `localhost` inside the emulator refers to the emulator itself.

The API URL is public configuration. Keep database credentials in `backend/.env`. Expo embeds variables with the [`EXPO_PUBLIC_` prefix](https://docs.expo.dev/guides/environment-variables/) in the app.

Restart Expo from the project root after adding the variable:

```powershell
npx expo start --clear
```

Open Chrome **inside the emulator** and visit `http://10.0.2.2:3000/health`. Confirm `database` is `connected` before proceeding. Use local HTTP for this emulator lesson; use an HTTPS API URL when hosting the backend.

## 7. Add the app's authentication helper

Create the `src/lib` folder if needed, then create `src/lib/auth.ts`:

```ts
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
```

Only the token is stored on the device. The helper removes it when the server rejects the session with `401`. A connection error keeps the saved token so you can retry. Logout contacts the server before removing the local token; if the server is unreachable, the screen reports the error and lets you retry.

## 8. Connect the existing login screen

Edit `src/app/login.tsx`.

Add these imports, change the existing React import, and add `ActivityIndicator` to your existing `react-native` import list:

```tsx
import { signIn } from "@/lib/auth";
import { router } from "expo-router";
import { useRef, useState } from "react";
```

Inside `LoginScreen`, after the existing email/password state, add:

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const submitting = useRef(false);

async function handleLogin() {
  if (submitting.current) return;
  setErrorMessage("");
  if (!email.trim() || !password) {
    setErrorMessage("Enter your email and password.");
    return;
  }
  submitting.current = true;
  setIsSubmitting(true);
  try {
    await signIn(email, password);
    setPassword("");
    router.replace("/");
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : "Login failed. Try again.");
  } finally {
    submitting.current = false;
    setIsSubmitting(false);
  }
}
```

Add `editable={!isSubmitting}` to **both** `TextInput` components.

Replace the existing disabled Submit `Pressable` and the old authentication comment immediately before it with:

```tsx
{errorMessage ? (
  <Text style={styles.errorText} accessibilityLiveRegion="polite">
    {errorMessage}
  </Text>
) : null}

<Pressable
  onPress={handleLogin}
  style={[styles.submit, isSubmitting && styles.disabled]}
  accessibilityRole="button"
  accessibilityLabel="Submit login"
  accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
  disabled={isSubmitting}
>
  {isSubmitting ? (
    <ActivityIndicator color={colors.surface} />
  ) : (
    <Text style={styles.submitText}>Submit</Text>
  )}
</Pressable>
```

In `StyleSheet.create`, remove `opacity: 0.6` from the `submit` style, and add these styles:

```tsx
disabled: { opacity: 0.6 },
errorText: {
  color: "#B91C1C",
  fontFamily: fonts.regular,
  fontSize: 14,
  marginBottom: spacing.md,
},
```

Keep the existing logo, input styles, keyboard handling, and Forgot password button.

## 9. Show the session on Home and add logout

Edit `src/app/(tabs)/index.tsx`.

Keep its existing `StyleSheet.create` block. Replace the imports and the entire `HomeScreen` function above that block with:

```tsx
import { getCurrentUser, signOut, type AuthUser } from "@/lib/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retry, setRetry] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setErrorMessage("");
    void getCurrentUser().then((account) => {
      if (active) setUser(account);
    }).catch((error: unknown) => {
      if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load your account.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [retry]));

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setErrorMessage("");
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Logout failed. Try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.brand}>Chartineer</Text>
        {!loading && !user ? (
          <Link href="/login" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Open login" style={styles.loginButton}>
              <Ionicons name="person-outline" size={24} color="#2563EB" />
            </Pressable>
          </Link>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome to Chartineer</Text>
        <Text style={styles.subtitle}>Your next discovery starts here.</Text>
        <View style={styles.card}>
          {loading ? <ActivityIndicator color="#2563EB" /> : user ? (
            <>
              <Text style={styles.cardTitle}>You are signed in</Text>
              <Text style={styles.cardDescription}>{user.email}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleLogout}
                disabled={loggingOut}
                accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
                style={[styles.signInButton, loggingOut && styles.pressed]}
              >
                <Text style={styles.signInText}>{loggingOut ? "Signing out…" : "Log out"}</Text>
              </Pressable>
            </>
          ) : !errorMessage ? (
            <>
              <Text style={styles.cardTitle}>Get started</Text>
              <Text style={styles.cardDescription}>Sign in to access your account.</Text>
              <Link href="/login" asChild>
                <Pressable accessibilityRole="button" style={styles.signInButton}>
                  <Text style={styles.signInText}>Sign in</Text>
                </Pressable>
              </Link>
            </>
          ) : null}
          {errorMessage ? (
            <>
              <Text style={styles.cardDescription} accessibilityLiveRegion="polite">{errorMessage}</Text>
              <Pressable accessibilityRole="button" style={styles.signInButton} onPress={() => setRetry((value) => value + 1)}>
                <Text style={styles.signInText}>Retry</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

`useFocusEffect` checks the saved session whenever Home becomes active, including after login. See the [Expo Router hooks reference](https://docs.expo.dev/router/reference/hooks/). Loading and connection failures have their own UI so the app does not silently treat a failed request as an expired session.

## 10. Run the checks and test

From the project root:

```powershell
node --check backend/passwords.mjs
node --check backend/seed-user.mjs
node --check backend/server.mjs
npx expo lint
npx tsc --noEmit
```

Keep both the API and Expo servers running. Open the app in your Android emulator and check these cases:

| Action | Expected result |
| --- | --- |
| Submit empty fields | Email/password prompt; no API call |
| Use a wrong password | Same incorrect-credentials message as an unknown email |
| Use the seeded account | Submit shows a spinner, then Home displays your email |
| Reload or reopen the app | Home loads the saved session and displays your email |
| Log out, then reload | Home shows Sign in; the session row was deleted |
| Stop the API while signed in, then reopen | Connection error and Retry; token remains saved |
| Restart the API and tap Retry | Account loads again |
| Repeatedly fail login more than five times | Rate-limit message; wait for the window or restart the local API |

In pgAdmin, connected to `chartineer`, you can inspect accounts and sessions without displaying their secrets:

```sql
SELECT id, email, created_at FROM public.users;
SELECT user_id, created_at, expires_at FROM public.sessions;
```

To test expiry, update only your test account's sessions using its actual email, then reopen the app:

```sql
UPDATE public.sessions
SET expires_at = NOW() - INTERVAL '1 minute'
WHERE user_id = (
  SELECT id FROM public.users WHERE LOWER(email) = LOWER('your-test-email@example.com')
);
```

Home should return to Sign in. Sign in again to create a fresh session.

If the emulator cannot reach `/health`, resolve the API connection before troubleshooting the form. The backend must be running on port 3000; check Windows Firewall if the emulator connection is blocked. For other setup problems, see [Troubleshooting](troubleshooting.md).

The next feature can be registration or password reset. Any future private API endpoint must verify the session server-side, just as `/auth/me` does.
