# Troubleshooting and checks

## Check the working directory

Expo commands run at the root. Backend npm scripts run in `backend/`. Each has its own `package.json`.

```powershell
Get-Location
```

## Expo cannot find a package

Install mobile dependencies from the root using `npx expo install <package>`. Login, signup, Home, and the tabs layout use the installed Ionicons package.

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

## Login or profile route is rejected by TypeScript

If a Link or navigation call reports `ts(2345)`, confirm the current files: `(tabs)/index.tsx` owns `/`, `login.tsx` owns `/login`, `signup.tsx` owns `/signup`, and `(tabs)/profile.tsx` owns `/profile`, all under `src/app/`. Dashboard's file has been deleted, but Home still links to `/dashboard` while signed in. Update those links and labels to Profile when fixing the UI. Inspect `.expo/types/router.d.ts` for stale routes; this workspace's generated types still include `/dashboard`, which currently lets those obsolete links pass typecheck.

Regenerate types from the project root:

```powershell
npx expo customize tsconfig.json
npx tsc --noEmit
```

In VS Code, use Ctrl+Shift+P -> TypeScript: Restart TS Server if the old underline remains. Current login/logout update AuthProvider; guards handle navigation. Do not restore the old explicit redirects solely to fix stale types. Generated files should not be edited or committed. See [Expo typed routes](https://docs.expo.dev/router/reference/typed-routes/).

The installed SDK 55 route watcher showed a Windows path-handling problem after files were added or renamed. A CLI refresh regenerated the correct routes in this workspace. If incorrect entries return, refresh again and restart Expo to rebuild its watcher context.

## Login appears again after Submit or reopening

Check `src/app/login.tsx`: it must call the `signIn` function from `useAuth()`, which stores the token and updates provider `user`. Calling only the helper from `src/lib/auth.ts` would leave navigation guards unaware of the new account.

A normal launch at `/` opens public Home. AuthProvider checks a saved token during startup. A valid session lets Profile show account details; no token or a 401 leaves the app signed out. Other session-check failures show root Retry. Login success normally returns to Home; use the Profile tab for the account screen until Home's obsolete Dashboard links are fixed.

## POP_TO warning or signup appears in tabs

`POP_TO` is a stack action emitted by `dismissTo`. If signup is inside `(tabs)`, its Back to home can try to pop to the `index` tab, which cannot handle that action. A file in `(tabs)` can also appear as an automatically discovered tab even without a `Tabs.Screen` entry.

Keep signup at `src/app/signup.tsx`, beside login, matching the root `<Stack.Screen name="signup" />`. The current signup Back to home uses `<Link href="/" replace asChild>`. Reload after moving files. Login still uses `dismissTo` from the root Stack; if changing it, `replace` is the alternative discussed for an explicit return to Home. See [SDK 55 Link](https://docs.expo.dev/versions/v55.0.0/sdk/router/link/).

## Login does not switch to dark mode

Login/signup follow the device theme, not the always-black public tabs. Enable Android's system dark theme. Check `app.json` has `userInterfaceStyle: "automatic"` and that `useColorScheme()` selects the matching palette. There is no manual app theme switch. See [theme testing](android-emulator.md#test-login-and-signup-dark-mode).

Import `setStatusBarStyle` directly from `expo-status-bar`; `StatusBar.setStatusBarStyle` is not the function used by this SDK. Status bar icon color and the form palette are separate settings.

## Signup buttons or policy links do not continue

Google and Apple stay disabled until the agreement checkbox is selected. Enabled provider buttons still show a not-available notice because authentication is not connected. Email signup validates email and shows the same kind of notice; it is not gated by the checkbox. Policy URLs are `null`, so the links show an unpublished notice. These are current UI placeholders, not backend failures.

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

Keep both Pressables: eye inside the password row, Submit below the error message. Use `src/app/login.tsx` as the current implementation reference and [Step 8](login.md#8-connect-the-existing-login-screen) for provider wiring.

## Login icons are above the fields or the eye does not work

Each icon and TextInput must share a View with `flex-row items-center` utilities. Include the eye button in the password row too. Each TextInput uses `flex-1 min-w-0`; the row's utility classes draw the border and background. The old `styles.inputRow` and `styles.inputText` objects have been removed.

The password input needs `secureTextEntry={!showPassword}`. Plain `secureTextEntry` keeps it masked regardless of the eye button's state. See [Login icons and password visibility](mobile-ui.md#login-icons-and-password-visibility).

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
| Profile redirects to login after sign-in | Confirm login calls provider `signIn` and updates `user`; check token storage and screen redirects |
| Home's signed-in account link does not open a screen | It still targets removed `/dashboard`; use the Profile tab and update the link to `/profile` |
| Session expired | Sign in again to create a new session |
| Token cannot be saved in a browser | Use Android/iOS for this native helper; implement web session storage separately |

`/auth/me` returning `401` without a token is expected. `/health` proves database connectivity; the [login checklist](login.md#10-run-the-checks-and-test) verifies the actual sign-in, reopen, expiry, and logout behavior.

## Session retry

AuthProvider owns session refresh; Profile reads the shared account without its own focus request. Root Retry calls `refreshSession()` after a failed session check. Restore API connectivity before retrying; a server failure is distinct from an expired token.

## Known login cleanup

- In `backend/seed-user.mjs`, the minimum-length check is 8 while the error message says 15. The guide's example uses 15. Align the rule and message when editing the script.
- `backend/package.json` includes an unnecessary `expo-secure-store` dependency. The mobile package already contains it. To remove the backend copy, run `npm uninstall expo-secure-store` inside `backend/`; keep the mobile dependency and its app config plugin.
- Password reset, email registration, provider authentication, published policy URLs, browser session storage, and role-based permissions remain future work. Signup UI is present.
- Home's Sign up button still has `accessibilityLabel="Search the market previews"` and a search-focus `onPress`; update these to match its signup action when editing the UI.
- Workspace currently displays `Markets` as its heading.
- Home's signed-in avatar and primary button still link to `/dashboard` after that screen was replaced by `/profile`; their labels still say Dashboard. Generated route types currently retain the deleted route, so typecheck does not expose this issue.
- Profile is declared as `profileScreen`. Rename it to `ProfileScreen` when editing the implementation: the lowercase name causes four `react-hooks/rules-of-hooks` errors. Profile retains a light welcome card, generic font weight utilities, and a hardcoded blue logout button.
- The tabs layout retains an empty `Tabs.Protected` block. Assets/Profile currently enforce signed-in access through screen redirects.
- Login's `Sign up` text has no navigation handler. Its Google/Apple buttons only show availability notices.
- Home still logs `user` to the console.

These are code cleanup or future-feature items. Runtime connection errors still require a running API and a responsive emulator.

## Git push and merge errors

For a missing or incorrect remote, `fetch first`, `non-fast-forward`, or merge conflicts, follow [Git remotes, merging, and pushing](git.md). Each command runs separately; complete the merge before pushing.

## Poppins does not appear

Confirm the root layout loads the variant and that Text/TextInput uses `font-poppins`, `font-poppins-semibold`, or `font-poppins-bold` from `tailwind.config.js`, or the exact `fonts` alias in a style object. Generic `font-medium`, `font-semibold`, or `font-bold` alone does not select a Poppins family. ExtraBold is loaded but has no custom Tailwind utility. Restart Expo after installing a font package.

## NativeWind classes do not apply

Check the [styling configuration map](mobile-ui.md#nativewind-styling-and-configuration): Babel must use the NativeWind JSX import source and preset, Metro must wrap its Expo config with `withNativeWind`, and the root layout must import `src/styles/global.css`. Tailwind scans `src/` and uses `nativewind/preset`. Web uses Metro in `app.json`.

If TypeScript rejects `className` or `contentContainerClassName`, confirm `nativewind-env.d.ts` references `nativewind/types` and remains in `tsconfig.json`'s include list. For ScrollView inner spacing, use `contentContainerClassName`. Keep conditional utilities as complete strings within Tailwind's content paths. Stop Expo and restart with `npx expo start --clear` after changing Babel, Metro, or Tailwind configuration. See [NativeWind installation](https://www.nativewind.dev/docs/getting-started/installation).

## Migration fails

Use the [migration error table](migrations.md#migration-errors) and inspect the command output. `/health` checks connectivity, not migration execution.

## Verification commands

From the root:

```powershell
npx expo lint
npx tsc --noEmit
Get-ChildItem -LiteralPath backend -Recurse -Filter *.mjs |
  Where-Object { $_.FullName -notmatch '[\\/]node_modules[\\/]' } |
  ForEach-Object { node --check $_.FullName }
```

Root TypeScript checks do not typecheck the `.mjs` backend. Syntax checks do not verify database connectivity or SQL execution. Use `/health`, inspect `pgmigrations`, and run the [login behavior checklist](login.md#10-run-the-checks-and-test). The recursive command includes the new app, database, middleware, and router modules while skipping dependencies.

On October 13, 2026, `npx tsc --noEmit` passed against the existing generated route types, and `npx expo lint` failed with four hook-rule errors in `src/app/(tabs)/profile.tsx`. See [Known login cleanup](#known-login-cleanup). No emulator or database runtime verification was performed for this documentation update.

After mobile dependency or Expo configuration changes, diagnose compatibility from the root:

```powershell
npx expo-doctor
npx expo install --check
```

If incompatibility is confirmed, review the package changes before running `npx expo install --fix`.
