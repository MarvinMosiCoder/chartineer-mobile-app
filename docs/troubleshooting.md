# Troubleshooting and checks

## Check the working directory

Expo commands run at the root. Backend npm scripts run in `backend/`. Each has its own `package.json`.

```powershell
Get-Location
```

## Expo cannot find a package

Install mobile dependencies from the root using `npx expo install <package>`. Both login and dashboard import `@expo/vector-icons/Ionicons`.

If a package is installed but Metro still cannot find it, stop Expo with Ctrl+C and restart from the root:

```powershell
npx expo start --clear
```

Reopen the app or browser preview. See [Expo's Windows cache guide](https://docs.expo.dev/troubleshooting/clear-cache-windows/).

To check icon-package resolution from the root:

```powershell
node -p "require.resolve('@expo/vector-icons/Ionicons')"
```

## Could not find a declaration file

`ts(7016)` for `cors`, `express`, or `pg` means the editor cannot find type declarations. Install these in `backend/` if needed:

```powershell
npm install --save-dev @types/cors @types/express @types/pg @types/node
```

In VS Code, use Ctrl+Shift+P -> **TypeScript: Restart TS Server** if warnings persist. The current root package also contains these declarations, which may already resolve in this workspace. See [Express declaration guidance](https://expressjs.com/en/starter/installing/#typescript).

## API and database connection errors

Start `npm run dev` in `backend/` and inspect its terminal:

| Error | Action |
| --- | --- |
| Connection refused | Check PostgreSQL is running and the host/port match |
| Password authentication failed | Correct the role's username/password in `.env` |
| Database does not exist | Match `PGDATABASE` to an existing database |
| `.env` not found | Create `backend/.env` and run inside `backend/` |
| Address already in use | Identify the process on port 3000 or choose another backend `PORT` |

Restart the API after changing `.env`. Check it from another terminal:

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/health'
```

Adjust the port if configured differently. HTTP 503 means the API is reachable but its database query failed; inspect the API terminal for the cause. An error before receiving an HTTP response points to the API address or availability.

## Browser CORS errors

Match `WEB_ORIGIN` to the browser application's actual origin, then restart the API. For example, Expo at `http://localhost:8082` requires that origin. `127.0.0.1` and `localhost` are different origins.

CORS controls browser access to responses. Native clients do not use browser CORS checks, and CORS is not authentication. See [Express CORS](https://expressjs.com/en/resources/middleware/cors/).

The current login helper stores tokens with native SecureStore. Browser login needs its own session-storage implementation even when CORS is configured correctly.

## Login or dashboard route is rejected by TypeScript

If `router.replace("/dashboard")` or `router.replace("/")` reports `ts(2345)`, confirm the files are `src/app/(tabs)/dashboard.tsx` and `src/app/index.tsx`. Login owns `/`; dashboard owns `/dashboard`. Inspect `.expo/types/router.d.ts` for those routes. Old `/login` entries or entries such as `/../lib/auth` can indicate stale or incorrect route types.

Regenerate types from the project root:

```powershell
npx expo customize tsconfig.json
npx tsc --noEmit
```

In VS Code, use Ctrl+Shift+P -> TypeScript: Restart TS Server if the old underline remains. Keep `router.replace("/dashboard")` after login and `router.replace("/")` after logout. Generated type files are refreshed by Expo and should not be edited or committed. See [Expo typed routes](https://docs.expo.dev/router/reference/typed-routes/).

The installed SDK 55 route watcher showed a Windows path-handling problem after files were added or renamed. A CLI refresh regenerated the correct routes in this workspace. If incorrect entries return, refresh again and restart Expo to rebuild its watcher context.

## Login appears again after Submit or reopening

If Submit returns to login, check its success handler in `src/app/index.tsx`: it must use `router.replace("/dashboard")`. The old `router.replace("/")` now points to login itself.

A normal launch at `/` currently opens login even if a SecureStore token exists. The dashboard checks the saved session when focused, but login has no startup session check. This behavior does not by itself mean the token was lost. Automatically opening the dashboard for an existing session needs a separate startup check.

## Custom splash logo does not appear

Android's custom image is configured at `assets/images/system-logo/system-logo.png`, with width 76 on a blue background. Confirm that path exists and build a new native app after changing it. The current image configuration is Android-only. Follow [Logo before the login screen](mobile-ui.md#logo-before-the-login-screen) for the exact plugin entry and preview limitations.

## Login logo image cannot be resolved

The login Image uses `require("@/assets/images/system-logo/system-logo.png")`. Confirm the PNG exists in the root assets directory and keep `"@/assets/*": ["./assets/*"]` in `tsconfig.json` alongside the general `@/*` alias. Restart Expo after editing aliases. See [Login logo and asset aliases](mobile-ui.md#login-logo-and-asset-aliases).

## Login controls reported as unused

The current complete screen uses `handleLogin`, `errorMessage`, and `setShowPassword`. If ESLint reports them as unused after editing JSX, check these connections:

| Warning | Connection to restore |
| --- | --- |
| `handleLogin` is defined but never used | Submit needs `onPress={handleLogin}` |
| `errorMessage` is assigned a value but never used | Render the error Text with `{errorMessage}` above Submit |
| `setShowPassword` is assigned a value but never used | The eye button needs `onPress={() => setShowPassword((value) => !value)}` |

Keep both Pressables: eye inside the password row, Submit below the error message. If several pieces are missing, use the [complete login file in Step 8](login.md#8-connect-the-existing-login-screen) to restore imports, state, inputs, both buttons, errors, and styles together.

## Login icons are above the fields or the eye does not work

Each icon and TextInput must share a `View` using `styles.inputRow`. Include the eye button in the password row too. Each TextInput should use `styles.inputText`; the row draws the surrounding border and background.

The password input needs `secureTextEntry={!showPassword}`. Plain `secureTextEntry` keeps it masked regardless of the eye button's state. See [Login icons and password visibility](mobile-ui.md#login-icons-and-password-visibility) and the complete Step 8 example.

## Expo cannot connect to port 5554

Check `adb devices -l`. If the emulator is offline, stop it through Device Manager, reset ADB, and cold boot it before retrying Expo. If Android Studio reports an already-running process, inspect and stop that specific emulator process. Follow [Android emulator setup and recovery](android-emulator.md) for the complete steps and process checks.

Wait until Android's Home screen responds and ADB reports `device`, then press `a` in Expo.

## Phone cannot reach the API

Use the computer's LAN IPv4 address and the same network. Test `/health` in the phone browser and check private-network firewall access. Expo and the API are separate services. See the [address table](setup.md#api-addresses).

For an Android emulator, use `http://10.0.2.2:3000` in the root `.env.local`. Verify the API at `http://localhost:3000/health` from the computer and `http://10.0.2.2:3000/health` inside the emulator. Keep `npm run dev` running in a separate backend terminal.

## Login request fails

| Symptom | What to check |
| --- | --- |
| Cannot reach the server | Start the API, check the emulator API URL, and test `/health` |
| Email or password is incorrect | Use the seeded account's credentials; reseeding an existing email does not change its password |
| Relation users or sessions does not exist | Apply existing migrations in `backend/` |
| Too many login attempts | Wait for the 15-minute window; the local in-memory limit resets if the API restarts |
| Dashboard still shows Sign in after login | Confirm login opens `/dashboard`, then check `getCurrentUser()` and session storage |
| Session expired | Sign in again to create a new session |
| Token cannot be saved in a browser | Use Android/iOS for this native helper; implement web session storage separately |

`/auth/me` returning `401` without a token is expected. `/health` proves database connectivity; the [login checklist](login.md#10-run-the-checks-and-test) verifies the actual sign-in, reopen, expiry, and logout behavior.

## Why the Retry dependency is intentional

The dashboard's focus callback lists `[retry]`, but its body does not read the counter. ESLint therefore reports `react-hooks/exhaustive-deps` as an unnecessary dependency unless the intentional use is documented with a suppression.

The counter acts as a trigger:

1. Tapping Retry increments `retry`.
2. React creates a new callback because that dependency changed.
3. `useFocusEffect` reruns the account request while the dashboard is focused.

Keep `[retry]` for this implementation. Removing it stops the Retry button from triggering another request. The current dashboard has these comments immediately above the dependency line:

```tsx
return () => { active = false; };

// Changing retry reruns the account request when Retry is tapped.
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [retry]));
```

The suppression applies to that line only and does not change runtime behavior. If the warning returns, check that the directive is immediately above `}, [retry]));`. A future refactor can use a shared loading function called by both focus and Retry, removing the counter and its suppression together.

## Known login cleanup

- In `backend/seed-user.mjs`, the minimum-length check is 8 while the error message says 15. The guide's example uses 15. Align the rule and message when editing the script.
- `backend/package.json` includes an unnecessary `expo-secure-store` dependency. The mobile package already contains it. To remove the backend copy, run `npm uninstall expo-secure-store` inside `backend/`; keep the mobile dependency and its app config plugin.
- Password reset and public registration remain future features. The former Forgot password styles have been removed from the current screen.
- The dashboard retains the former welcome content, a `Home` tab title, and the component name `HomeScreen`. These can be updated without changing its `/dashboard` route.

These are code cleanup or future-feature items. Runtime connection errors still require a running API and a responsive emulator.

## Git push and merge errors

For a missing or incorrect remote, `fetch first`, `non-fast-forward`, or merge conflicts, follow [Git remotes, merging, and pushing](git.md). Each command runs separately; complete the merge before pushing.

## Poppins does not appear

Confirm the root layout loads the variant and that the Text or TextInput style uses its exact family alias. A surrounding View's font style does not set a global font for its text children. Restart Expo after installing a font package.

## Migration fails

Use the [migration error table](migrations.md#migration-errors) and inspect the command output. `/health` checks connectivity, not migration execution.

## Verification commands

From the root:

```powershell
npx expo lint
npx tsc --noEmit
node --check backend/server.mjs
node --check backend/passwords.mjs
node --check backend/seed-user.mjs
```

Root TypeScript checks do not typecheck the `.mjs` backend. Its syntax checks do not verify database connectivity or SQL execution. Use `/health` and inspect `pgmigrations` for those checks, then run the login behavior checklist. The intentional Retry dependency has a suppression limited to that line; it should not produce a lint warning in the current dashboard.

After mobile dependency or Expo configuration changes, diagnose compatibility from the root:

```powershell
npx expo-doctor
npx expo install --check
```

If incompatibility is confirmed, review the package changes before running `npx expo install --fix`.
