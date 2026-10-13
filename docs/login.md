# Login and saved sessions

This guide describes the implemented authentication flow as of October 13, 2026. Source files are the implementation reference; the previous login-first screen and monolithic server examples have been replaced by the current file map and runtime steps.

## Current setup and runtime checklist

| Part | Current implementation |
| --- | --- |
| Public Home | `src/app/(tabs)/index.tsx`, route `/` |
| Login | `src/app/login.tsx`, route `/login` |
| Signup UI | `src/app/signup.tsx`, route `/signup`; registration is not connected |
| Account state | `src/providers/auth-provider.tsx` |
| Native requests/storage | `src/lib/auth.ts` |
| Route guards | Root `_layout.tsx` for login/signup; screen redirects in Assets and Profile |
| Profile | `src/app/(tabs)/profile.tsx`, route `/profile`, account email and logout |
| Backend | [Modular app and routes](backend.md) |
| Password helpers | `backend/passwords.mjs`, salted scrypt hashing/verification |
| Test accounts | `backend/seed-user.mjs` |
| Database | Existing users and sessions migrations |

Before testing, apply both migrations, run PostgreSQL and `npm run dev` in `backend/`, start Expo at the root, and confirm the emulator is responsive. Its `.env.local` API address is `http://10.0.2.2:3000`. See [Setup](setup.md) and [Emulator recovery](android-emulator.md).

## 1. Dependencies and configuration

SecureStore is installed in the mobile package and configured as an app plugin. The backend uses Express, CORS, pg, express-rate-limit, and Node crypto. Do not add packages just to follow this guide on the existing checkout.

SecureStore authentication supports the native app. Browser authentication needs a separate storage implementation. See [SDK 55 SecureStore](https://docs.expo.dev/versions/v55.0.0/sdk/securestore/).

## 2. Existing sessions migration

Apply existing migrations from `backend/`:

```powershell
npm run migrate -- up
```

Do not create duplicate tables. The sessions table stores token hashes, user references, and expiry timestamps; see [Database migrations](migrations.md).

## 3. Password hashing

`backend/passwords.mjs` exports asynchronous `hashPassword` and `verifyPassword`. It stores a `scrypt-v1` encoded salt and derived key, and uses timing-safe comparison. The password hash is not returned by API responses. Always use the helper for local accounts rather than inserting a plain password.

## 4. Create your first test account

The seed script already exists. Run this in PowerShell from `backend/`:

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

Reseeding an existing email does not change its password. The current code checks a minimum of 8 characters while the message says 15; entering 15 or more satisfies both. This mismatch remains [known cleanup](troubleshooting.md#known-login-cleanup).

## 5. Authentication API and middleware

| Endpoint | Behavior |
| --- | --- |
| `GET /health` | Public database connectivity check |
| `POST /auth/login` | Validates email/password and creates a seven-day session |
| `GET /auth/me` | Uses `requireAuth` and returns `{ user: req.user }` |
| `POST /auth/logout` | Deletes the supplied token hash and returns 204 |

Login returns `{ token, expiresAt, user: { id, email } }`. Tokens contain 32 random bytes encoded as 64 hexadecimal characters. PostgreSQL stores their SHA-256 hashes. Unknown accounts still run a dummy password comparison; wrong credentials share the same message. Login limits failed attempts to five per IP per 15-minute window using local in-memory storage. Successful attempts do not count toward that limit.

`createRequireAuth(pool)` validates the Bearer token, checks the session and expiry in PostgreSQL, attaches `req.user`, and calls `next()`. `/auth/me` is an endpoint that uses this middleware; it is not itself the middleware. Logout reads the token directly and can return 204 for a well-formed token whose session is already absent. See [Backend architecture](backend.md).

Mobile route guards control navigation. Backend middleware controls API access and must protect every future private endpoint. No roles, role assignments, or module permissions are implemented.

## 6. Mobile API address

At the root, `.env.local` needs:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

Restart Expo after changing it. Keep PostgreSQL credentials in `backend/.env`. Use [other device addresses](setup.md#api-addresses) when testing a physical phone.

## 7. Native helper and AuthProvider

`src/lib/auth.ts` provides `signIn`, `getCurrentUser`, and `signOut`. Requests time out after 15 seconds. Tokens use the SecureStore key `chartineer.session`.

- Sign-in saves the returned token before returning the account. If saving fails, it attempts to revoke the new session.
- Current-user lookup returns null without a token. A 401 clears the token and returns null; connectivity/server errors propagate.
- Sign-out requests revocation before clearing local storage. A connectivity error keeps the local session so logout can be retried.

`AuthProvider` exposes `user`, `isLoading`, `error`, `refreshSession`, `signIn`, and `signOut`. It checks the saved token once on mount and rechecks a signed-in user's session when the app moves from background/inactive to active. A ref prevents session checks, login, and logout from overlapping.

The root shows a startup indicator or session-error Retry before rendering navigation. A failed session refresh is not treated as an expired token. A 401 clears the account; other refresh failures show the root error state. Profile reads the shared account; AuthProvider owns session refresh.

## 8. Connect the existing login screen

`src/app/login.tsx` calls `useAuth()` and submits through provider `signIn(email, password)`. It validates empty fields, prevents duplicate presses, disables controls during submission, and displays errors. Success clears the password and visibility state.

There is no explicit redirect in the handler. Updating `user` makes `Stack.Protected guard={!user}` remove login/signup from navigation; the app normally returns to public Home. Use the Profile tab for account details and logout. Home's signed-in avatar and primary action still target the deleted `/dashboard` route and need updating. Login's back link currently uses `/` with `dismissTo` in the root Stack.

Google and Apple login buttons now appear below the email/password form. They show availability notices; email/password remains the connected login method. The `Sign up` text beside the back arrow is not a Link or button.

For form/theme details, see [Mobile UI](mobile-ui.md#login-icons-and-password-visibility). Edit the current source rather than copying the old `src/app/index.tsx` login example.

## 9. Profile, Assets, and logout

Profile replaces the deleted Dashboard screen. It is registered as a visible tab outside the empty `Tabs.Protected` block. Its screen redirects to `/login` when `user` is absent; while signed in it displays the account email and calls provider `signOut`. Its local pending state prevents duplicate logout and displays failures. Successful logout clears `user`, so Profile redirects to login; its tab remains visible.

Assets is a visible public tab whose screen redirects to `/login` when `user` is absent. Signed-in Assets is still a placeholder. Neither navigation pattern replaces server-side authentication for future data requests.

## 10. Run the checks and test

Run the [verification commands](troubleshooting.md#verification-commands), then test on a native device or emulator with the API and PostgreSQL running:

The October 13 checks found four hook-rule lint errors from Profile's lowercase `profileScreen` name. Typecheck passed with generated route types that still include `/dashboard`; that does not validate the removed route. The table below is a device checklist, not a record of completed runtime tests.

| Action | Expected behavior |
| --- | --- |
| Launch without a saved token | Public Home; login/signup available; all five tabs visible |
| Open login and submit empty fields | Validation message; no request |
| Submit incorrect credentials | Incorrect-credentials error; remain signed out |
| Submit correct credentials | Token saved, login removed by guards, Home normally shown; Profile can render the account |
| Open the Profile tab while signed in | Account email and logout button |
| Use Home's signed-in account links | Known issue: they still target removed `/dashboard`; use the Profile tab |
| Press Google or Apple on login | Availability notice; no provider authentication |
| Reopen with a valid saved token | Startup verifies `/auth/me`; signed-in state restored without resubmitting credentials |
| Resume a signed-in app | Provider rechecks the saved session |
| Use an expired/revoked token | `/auth/me` returns 401; local token/account cleared; Profile/Assets redirect to login |
| Stop API while checking a saved token | Session error with Retry; no false successful restoration |
| Log out from Profile | Session revoked and local token cleared; Profile redirects to login; tab remains visible |
| Fail logout because API is offline | Error shown; local account remains so logout can be retried |
| Select Assets or Profile while signed out | Login opens |
| Return from signup to Home | Home opens without the earlier tab `POP_TO` warning |
| Toggle signup checkbox | Google/Apple disabled when unchecked, enabled when checked, disabled again when unchecked |
| Press an enabled signup method | Availability notice; no account is created |
| Open either policy link | Unpublished notice while URL is null |
| Change device light/dark theme | Login/signup text, backgrounds, and buttons update |

Do not infer emulator, database, or authentication runtime success from lint and typechecking alone. Public registration, Google/Apple authentication, policy publication, password reset, browser session storage, and role-based authorization remain future work.
