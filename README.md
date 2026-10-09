# Chartineer

Expo SDK 55 application with an Express API and PostgreSQL database.

## Documentation

- [Setup and daily development](docs/setup.md): dependencies, PostgreSQL, environment variables, and running both servers.
- [Database migrations](docs/migrations.md): schema, applying changes, new migrations, and rollback behavior.
- [Mobile screens, shared styles, and Poppins](docs/mobile-ui.md): routes, tabs, login layout, icons, and fonts.
- [Build login step by step](docs/login.md): test account, authentication API, Android emulator connection, saved sessions, and logout.
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

Home, tabs, Poppins fonts, and the login form are present. Submit calls the API and saves a session token with SecureStore. Home loads the current account and offers logout. The API includes `/health`, `/auth/login`, `/auth/me`, and `/auth/logout`; migrations create `users` and `sessions`, and `seed-user.mjs` creates local test accounts.

Password reset and public registration are future features. Native login is configured for Android and iOS; browser session storage needs its own implementation. Verify the complete login, reopen, and logout flow on a working emulator using the [login checklist](docs/login.md#10-run-the-checks-and-test).

## Checks

Run from the project root:

```powershell
npx expo lint
npx tsc --noEmit
node --check backend/server.mjs
node --check backend/passwords.mjs
node --check backend/seed-user.mjs
```

The current Home screen has one nonblocking lint warning about its `retry` callback dependency. Known cleanup items and fixes are documented in [Troubleshooting](docs/troubleshooting.md).
