# Chartineer

Expo SDK 55 mobile application with an Express 5 API and PostgreSQL database. Documentation reflects the current source as of October 12, 2026.

## Documentation

- [Setup and daily development](docs/setup.md): dependencies, PostgreSQL, environment variables, and running both servers.
- [Mobile screens, tabs, and themes](docs/mobile-ui.md): public Home, authentication screens, tab styling, signup consent, Poppins, and splash configuration.
- [Login and saved sessions](docs/login.md): test accounts, AuthProvider, session restoration, route guards, logout, and runtime checks.
- [Backend routes and authentication middleware](docs/backend.md): module responsibilities, endpoints, and adding protected routes.
- [Database migrations](docs/migrations.md): schema, applying changes, new migrations, and rollback behavior.
- [Android emulator setup and recovery](docs/android-emulator.md): device startup, offline devices, and theme testing.
- [Git remotes, merging, and pushing](docs/git.md): remotes, merges, and conflicts.
- [Troubleshooting and checks](docs/troubleshooting.md): navigation warnings, themes, connection errors, and verification.

## Start development

Complete the [first-time setup](docs/setup.md#first-time-setup) first.

At the project root:

```powershell
npx expo start
```

In a second terminal:

```powershell
cd backend
npm run dev
```

The computer uses `http://localhost:3000/health`. Set `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000` in the root `.env.local` for the Android emulator. Wait for Android's Home screen and an ADB `device` state before pressing `a` in Expo.

## Current progress

The default route `/` is public Home in `src/app/(tabs)/index.tsx`. Home has searchable sample markets, category cards, and account links. Home, Markets, Workspace, and Assets appear in the black bottom bar; Dashboard appears only while signed in. Markets, Workspace, and signed-in Assets are placeholders. Workspace currently renders the heading `Markets`.

Login lives at `/login`, and signup at `/signup`, outside the tabs folder. Both follow the device's light/dark theme through `src/styles/login-theme.ts`. Tab icons are size 18, labels use Poppins Regular at size 11, and the bar has `paddingTop: 5`.

AuthProvider checks the saved native SecureStore token on startup and rechecks a signed-in session when the app resumes. Root guards make login/signup available only while signed out, and a tabs guard protects Dashboard. Selecting Assets while signed out redirects to `/login`. Sign-in updates provider state; guards remove login and return to available navigation, normally Home. Open Dashboard from Home or its tab. Logout revokes the session and updates the guards.

Signup has Google and Apple buttons, an email field, and policy links. An initially unchecked agreement checkbox disables the provider buttons until selected. Provider and email signup currently show availability notices; no account creation or provider authentication is connected. Email signup is not gated by the checkbox. Terms and Privacy URLs are `null`, so their links show an unpublished notice.

The API is split across startup, app assembly, database setup, authentication middleware, routers, and an error handler. It exposes `/health`, `/auth/login`, `/auth/me`, and `/auth/logout`. Migrations create `users` and `sessions`; `seed-user.mjs` creates local accounts. Backend middleware validates sessions independently of mobile navigation. Role-based authorization has not been implemented.

The native splash remains visible while fonts and the initial session check load. Android uses `assets/images/system-logo/system-logo.png` at width 76 on blue `#208AEF`. Browser authentication storage, public registration, provider authentication, published policies, and password reset remain future work. Use the [runtime checklist](docs/login.md#10-run-the-checks-and-test) to verify behavior on a device.

## Checks

Run from the project root:

```powershell
npx expo lint
npx tsc --noEmit
Get-ChildItem -LiteralPath backend -Recurse -Filter *.mjs |
  Where-Object { $_.FullName -notmatch '[\\/]node_modules[\\/]' } |
  ForEach-Object { node --check $_.FullName }
```

These checks cover lint, mobile types, and backend syntax. They do not test SQL or emulator interactions. See [remaining cleanup](docs/troubleshooting.md#known-login-cleanup).
