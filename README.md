# Chartineer

Expo SDK 55 application with an Express API and PostgreSQL database.

## Documentation

- [Setup and daily development](docs/setup.md): dependencies, PostgreSQL, environment variables, and running both servers.
- [Database migrations](docs/migrations.md): schema, applying changes, new migrations, and rollback behavior.
- [Mobile screens, shared styles, and Poppins](docs/mobile-ui.md): login icons, password visibility, green theme, routes, Android splash logo, and fonts.
- [Build login step by step](docs/login.md): complete login screen, test account, authentication API, saved sessions, and logout.
- [Android emulator setup and recovery](docs/android-emulator.md): starting Pixel 7, offline devices, port 5554 errors, and stuck processes.
- [Git remotes, merging, and pushing](docs/git.md): configure GitHub, combine histories, resolve conflicts, and push.
- [Troubleshooting and checks](docs/troubleshooting.md): common errors and verification commands.

## Start development

Complete the [first-time setup](docs/setup.md#first-time-setup) first.

In a terminal at the project root:

```powershell
npx expo start
```

In a second terminal at the project root:

```powershell
cd backend
npm run dev
```

On the development computer, the API health endpoint is `http://localhost:3000/health`. The Android emulator uses `http://10.0.2.2:3000`; configure this as `EXPO_PUBLIC_API_URL` in the root `.env.local`.

Start the emulator and wait for Android's Home screen before pressing `a` in Expo. `adb devices` should report the emulator as `device`. See the [emulator guide](docs/android-emulator.md) if it reports `offline` or Android Studio says the device is already running.

## Current progress

The default route `/` is the login form in `src/app/index.tsx`. Submit calls the API, saves a session token with SecureStore, and replaces login with `/dashboard`. The dashboard loads the current account and offers logout, which returns to `/`. Tabs and Poppins fonts are present. The API includes `/health`, `/auth/login`, `/auth/me`, and `/auth/logout`; migrations create `users` and `sessions`, and `seed-user.mjs` creates local test accounts.

The login form shows a centered system logo above the Chartineer text, email and lock icons inside the fields, and an eye button for showing or hiding the password. Submit has a loading spinner, and validation/API errors appear above it. The shared primary color is green (`#0F7058`), used by the login logo text, Submit button, and active tab styling.

The native splash stays visible while fonts load. Android now uses `assets/images/system-logo/system-logo.png` at width 76 on a blue `#208AEF` background; see [Logo before the login screen](docs/mobile-ui.md#logo-before-the-login-screen) for configuration and native build checks. The dashboard still contains the former welcome content and its tab is currently labeled Home.

Password reset and public registration are future features. Native login is configured for Android and iOS; browser session storage needs its own implementation. A normal launch at `/` opens login even if a token is saved; automatically skipping login and protecting dashboard navigation are future work. Verify the login, saved-session, and logout behavior on a working emulator using the [login checklist](docs/login.md#10-run-the-checks-and-test).

## Checks

Run from the project root:

```powershell
npx expo lint
npx tsc --noEmit
node --check backend/server.mjs
node --check backend/passwords.mjs
node --check backend/seed-user.mjs
```

The dashboard keeps its intentional `[retry]` dependency with a comment and a lint suppression limited to that line. See [Why the Retry dependency is intentional](docs/troubleshooting.md#why-the-retry-dependency-is-intentional) and the remaining [login cleanup](docs/troubleshooting.md#known-login-cleanup).
