# Troubleshooting and checks

## Check the working directory

Expo commands run at the root. Backend npm scripts run in `backend/`. Each has its own `package.json`.

```powershell
Get-Location
```

## Expo cannot find a package

Install mobile dependencies from the root using `npx expo install <package>`. The existing home screen imports `@expo/vector-icons/Ionicons`.

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

## Home route is rejected by TypeScript

If `router.replace("/")` reports `ts(2345)` while Home exists at `src/app/(tabs)/index.tsx`, inspect `.expo/types/router.d.ts`. The correct generated routes include `/` and `/(tabs)`. Generated entries such as `/index` or `/../lib/auth` indicate incorrect route types.

Regenerate types from the project root:

```powershell
npx expo customize tsconfig.json
npx tsc --noEmit
```

In VS Code, use Ctrl+Shift+P -> TypeScript: Restart TS Server if the old underline remains. Keep `router.replace("/")`; generated type files are refreshed by Expo and should not be edited or committed. See [Expo typed routes](https://docs.expo.dev/router/reference/typed-routes/).

The installed SDK 55 route watcher showed a Windows path-handling problem after files were added or renamed. A CLI refresh regenerated the correct routes in this workspace. If incorrect entries return, refresh again and restart Expo to rebuild its watcher context.

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
| Home still shows Sign in after login | Confirm Home calls `getCurrentUser()` and reload the account after navigation |
| Session expired | Sign in again to create a new session |
| Token cannot be saved in a browser | Use Android/iOS for this native helper; implement web session storage separately |

`/auth/me` returning `401` without a token is expected. `/health` proves database connectivity; the [login checklist](login.md#10-run-the-checks-and-test) verifies the actual sign-in, reopen, expiry, and logout behavior.

## Known login cleanup

- In `backend/seed-user.mjs`, the minimum-length check is 8 while the error message says 15. The guide's example uses 15. Align the rule and message when editing the script.
- `backend/package.json` includes an unnecessary `expo-secure-store` dependency. The mobile package already contains it. To remove the backend copy, run `npm uninstall expo-secure-store` inside `backend/`; keep the mobile dependency and its app config plugin.
- Forgot password styles remain in the login screen, but its control and reset endpoints have not been implemented.
- Home's `[retry]` callback dependency intentionally recreates the focus effect when Retry is pressed. ESLint warns because the callback body does not read the counter. The [Home example](login.md#9-show-the-session-on-home-and-add-logout) now includes an explanation and a lint suppression limited to that dependency line. A stable loading function called explicitly by both focus and Retry is another possible refactor.

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

Root TypeScript checks do not typecheck the `.mjs` backend. Its syntax checks do not verify database connectivity or SQL execution. Use `/health` and inspect `pgmigrations` for those checks, then run the login behavior checklist. Lint currently completes with one nonblocking `retry` dependency warning in the Home screen.

After mobile dependency or Expo configuration changes, diagnose compatibility from the root:

```powershell
npx expo-doctor
npx expo install --check
```

If incompatibility is confirmed, review the package changes before running `npx expo install --fix`.
