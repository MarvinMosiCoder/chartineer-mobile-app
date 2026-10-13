# Chartineer

Expo SDK 55 mobile application with NativeWind 4 styling, an Express 5 API, and a PostgreSQL database. Documentation reflects the current source as of October 13, 2026.

## Documentation

- [Setup and daily development](docs/setup.md): dependencies, PostgreSQL, environment variables, and running both servers.
- [Mobile screens, tabs, and themes](docs/mobile-ui.md): public Home, Profile, NativeWind configuration, the center Home button, authentication screens, signup consent, Poppins, and splash configuration.
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

The default route `/` is public Home in `src/app/(tabs)/index.tsx`. Home has searchable sample markets, category cards, and account links. The bottom bar shows Markets, Workspace, Home, Assets, and Profile in that order. Home is a raised green circular button in the center. Markets, Workspace, and signed-in Assets are placeholders. Workspace currently renders the heading `Markets`.

Screens use NativeWind `className` utilities and ScrollView `contentContainerClassName`; `src/styles/global.ts` now exports `globalClasses` instead of `globalStyles`. Login lives at `/login`, and signup at `/signup`, outside the tabs folder. Both use `dark:` utilities for appearance and `src/styles/login-theme.ts` for icon, input, and spinner colors. The tab bar is height 96 with bottom safe-area padding; side icons are size 18 and the center Home icon is size 26. See [NativeWind styling](docs/mobile-ui.md#nativewind-styling-and-configuration).

AuthProvider checks the saved native SecureStore token on startup and rechecks a signed-in session when the app resumes. Root guards make login/signup available only while signed out. Assets and Profile remain visible tabs and redirect signed-out visitors to `/login`. Sign-in updates provider state; guards remove login and return to available navigation, normally Home. Profile at `/profile` displays the account email and logout button. Logout revokes the session and clears the local account.

Dashboard's route file has been removed, but Home's signed-in avatar and primary button still target `/dashboard`. Use the Profile tab for account details and logout until those links are updated. Profile's lowercase `profileScreen` component name also currently causes four hook-rule lint errors; see [remaining cleanup](docs/troubleshooting.md#known-login-cleanup).

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

On October 13, 2026, `npx tsc --noEmit` passed; `npx expo lint` reported four hook-rule errors in `profile.tsx`. Generated route types can still contain the removed Dashboard route, so a passing typecheck does not establish that Home's account links work. These checks do not test SQL or emulator interactions. See [remaining cleanup](docs/troubleshooting.md#known-login-cleanup).
