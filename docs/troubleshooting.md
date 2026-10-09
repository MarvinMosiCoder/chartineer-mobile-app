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

## Phone cannot reach the API

Use the computer's LAN IPv4 address and the same network. Test `/health` in the phone browser and check private-network firewall access. Expo and the API are separate services. See the [address table](setup.md#api-addresses-for-later-app-integration).

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
```

Root TypeScript checks do not typecheck the `.mjs` backend. Its syntax check does not verify database connectivity or SQL execution. Use `/health` and inspect `pgmigrations` for those checks.

After mobile dependency or Expo configuration changes, diagnose compatibility from the root:

```powershell
npx expo-doctor
npx expo install --check
```

If incompatibility is confirmed, review the package changes before running `npx expo install --fix`.
