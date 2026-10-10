# Setup and daily development

This guide documents Chartineer's existing setup as of October 10, 2026. Commands use PowerShell on Windows and npm. There are two independent packages: the Expo app at the root and the Node.js API in `backend/`.

## How the parts connect

```text
Expo application -> HTTP API in backend/server.mjs -> PostgreSQL
```

The backend holds the database credentials. The app calls `/auth/login`, saves its session token with SecureStore, and uses `/auth/me` and `/auth/logout` to restore the account and sign out. See the [login guide](login.md) for the files and request flow.

The default route `/` opens the login screen directly. Successful login opens `/dashboard`, and logout returns to `/`. The splash stays visible while fonts load; follow the [mobile UI guide](mobile-ui.md#logo-before-the-login-screen) to add a custom opening logo. A saved token does not currently skip login on a normal launch.

## Prerequisites

| Tool | Project baseline | Purpose |
| --- | --- | --- |
| Node.js | 24.x; currently 24.15.0 on the development machine | Runs npm, Expo tooling, and the API |
| npm | Included with Node.js | Installs each package's dependencies |
| PostgreSQL | 14 or newer for the migration tool's supported range | Stores data |
| pgAdmin or psql | A working local connection | Creates the database and inspects tables |
| Editor | VS Code or another editor | Edits code |
| App viewer | Expo Go compatible with SDK 55 on Android or iOS | Opens the native login flow |
| Android Studio and SDK tools | Android Emulator and `adb` available | Runs the Android emulator |

The mobile package uses Expo 55, React Native 0.83, and React 19.2. Check `package.json` before changing Expo APIs and use the [SDK 55 reference](https://docs.expo.dev/versions/v55.0.0/).

Check the tools:

```powershell
node --version
npm --version
```

In pgAdmin, check the database server:

```sql
SELECT version();
```

## First-time setup

### 1. Open the project root

```powershell
cd 'C:\Users\Digits-User\Desktop\chartineer-mobile-app'
```

Use your own location if you copy the project elsewhere. Commands below state whether they run at the root or inside `backend/`.

### 2. Install both sets of dependencies

From the root:

```powershell
npm ci
```

In a separate terminal, install API dependencies:

```powershell
cd 'C:\Users\Digits-User\Desktop\chartineer-mobile-app\backend'
npm ci
```

Both packages have lockfiles. `npm ci` restores the recorded versions and replaces that package's existing `node_modules`. Add new mobile dependencies with `npx expo install <package>` at the root. Add server dependencies with npm inside `backend/`.

### 3. Create the PostgreSQL account and database

Run this once for a new database server. If `chartineer_app` and `chartineer` already exist, continue to environment setup.

In pgAdmin, connect as your PostgreSQL administrator and open Query Tool on the `postgres` database:

```sql
CREATE ROLE chartineer_app
WITH LOGIN PASSWORD 'replace_with_a_strong_password';
```

Replace the password placeholder. Escape an apostrophe in a SQL password literal as two apostrophes.

Clear the editor, then run this separately with auto-commit enabled:

```sql
CREATE DATABASE chartineer OWNER chartineer_app;
```

`CREATE DATABASE` must run outside a transaction. The application account owns its database and will own the objects created by migrations. See [PostgreSQL CREATE DATABASE](https://www.postgresql.org/docs/current/sql-createdatabase.html).

### 4. Configure the backend environment

From the root, create `.env` only if it is missing:

```powershell
if (!(Test-Path -LiteralPath 'backend/.env')) {
  Copy-Item -LiteralPath 'backend/.env.example' -Destination 'backend/.env'
}
```

Open `backend/.env` and enter local settings:

```dotenv
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=chartineer
PGUSER=chartineer_app
PGPASSWORD="replace_with_your_local_database_password"
WEB_ORIGIN=http://localhost:8081
```

`PGPASSWORD` is the password for `chartineer_app`. `PGPORT` must match PostgreSQL's port. The `pg` connection pool reads these `PG...` variables. See [node-postgres connection settings](https://node-postgres.com/features/connecting).

`WEB_ORIGIN` is the browser app's origin, including protocol and port. Update it if Expo opens on another origin, such as `http://localhost:8082`.

The root `.gitignore` excludes `/backend/.env`. The example contains placeholders and can be shared. Keep credentials in the backend; Expo's `EXPO_PUBLIC_...` variables are included in the app bundle. See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).

### 5. Apply existing migrations

Inside `backend/`:

```powershell
npm run migrate -- up
```

This applies both existing migrations: `create-users` and `create-sessions`, then records them in `pgmigrations`. Follow the [migration guide](migrations.md) for schema details and future changes. Use the existing migration files when setting up another database; create a new migration only for a new schema change.

### 6. Start the API

Inside `backend/`:

```powershell
npm run dev
```

The default address is `http://localhost:3000`. The development server listens on `0.0.0.0` for testing from other devices on the local network.

The script uses Node's `--env-file` to load `.env` and `--watch` to restart after source changes. Restart manually with Ctrl+C and `npm run dev` after editing `.env`. See [Node CLI options](https://nodejs.org/api/cli.html).

In another terminal, check connectivity:

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/health'
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

`/health` executes `SELECT 1`. It verifies connectivity; inspect migration history separately to confirm both tables exist. Failed database queries return HTTP 503 with `database: "unavailable"` and log the reason in the API terminal.

### 7. Configure the mobile API address

Create `.env.local` at the project root, beside the mobile `package.json`. For the Android emulator:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

Use the [API address table](#api-addresses) for other devices. Restart Expo after adding or changing the variable. Keep database credentials in `backend/.env`; this public variable contains the API URL.

### 8. Create a local login account

Migrations create tables without creating an account. Follow [Create your first test account](login.md#4-create-your-first-test-account) to run `seed-user.mjs` with an email and password entered through PowerShell prompts. If you already created an account, use its existing credentials.

The seed script leaves an existing account's password unchanged. Its current validation checks 8 characters but its error message says 15; the guide uses 15 or more. See [Known login cleanup](troubleshooting.md#known-login-cleanup) for this mismatch.

### 9. Start Expo and the emulator

In another terminal at the root:

```powershell
npx expo start
```

Start a configured emulator in Android Studio and wait for Android's Home screen. Run `adb devices` in another terminal and confirm it reports `device`, then press `a` in Expo. See [Android emulator setup and recovery](android-emulator.md) if the emulator is offline or already running without responding.

For a physical phone, scan the QR code with compatible Expo Go and put the phone and computer on the same Wi-Fi. Pressing `w` opens the browser preview, but the current authentication helper uses native SecureStore and needs a separate browser storage approach before web login works. See [Expo start developing](https://docs.expo.dev/get-started/start-developing/).

## Daily development

| Task | Run from | Command |
| --- | --- | --- |
| Start the app | Root | `npx expo start` |
| Start the API | `backend/` | `npm run dev` |
| Apply pending migrations | `backend/` | `npm run migrate -- up` |
| Check lint | Root | `npx expo lint` |
| Check TypeScript | Root | `npx tsc --noEmit` |
| Check API syntax | Root | `node --check backend/server.mjs` |
| Check Android device | Any terminal with SDK tools on PATH | `adb devices` |
| Refresh generated route types | Root | `npx expo customize tsconfig.json` |

Keep Expo and the API in separate terminals. PostgreSQL must also be running.

## API addresses

Set `EXPO_PUBLIC_API_URL` to the address for the device running the app:

| App runs on | Local development API address |
| --- | --- |
| Browser on the computer | `http://localhost:3000` |
| Android Studio emulator | `http://10.0.2.2:3000` |
| Physical phone on the same LAN | `http://YOUR_COMPUTER_LAN_IP:3000` |

Android Emulator reserves `10.0.2.2` for host access. See [Android Emulator network addresses](https://developer.android.com/studio/run/emulator-networking-address).

Use `ipconfig` on Windows to find the active adapter's IPv4 address. A phone's `localhost` refers to the phone. Test `/health` in the phone browser first; check private-network firewall access if it cannot connect. Expo's tunnel exposes the Expo server, not this separate backend.

These HTTP addresses are for local development. A deployed API should use HTTPS.

## Verify login and continue development

Use the [login test checklist](login.md#10-run-the-checks-and-test) to check correct and incorrect credentials, session restoration, expiry, and logout. Keep PostgreSQL, the API, Expo, and the emulator running while testing.

Public registration and password reset are future features. The current login screen has an active Submit button; Forgot password is not rendered, although its styles remain in the file.
