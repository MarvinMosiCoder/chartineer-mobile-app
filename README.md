# Chartineer

Expo SDK 55 application with an Express API and PostgreSQL database.

## Documentation

- [Setup and daily development](docs/setup.md): dependencies, PostgreSQL, environment variables, and running both servers.
- [Database migrations](docs/migrations.md): schema, applying changes, new migrations, and rollback behavior.
- [Mobile screens, shared styles, and Poppins](docs/mobile-ui.md): routes, tabs, login layout, icons, and fonts.
- [Build login step by step](docs/login.md): test account, authentication API, Android emulator connection, saved sessions, and logout.
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

On the development computer, the API health endpoint is `http://localhost:3000/health`.

## Current progress

Home, bottom navigation, and the login form layout are present. The API exposes a database health check, and the first migration creates the users table. Account creation, authentication, password reset, and app-to-API requests are the next development steps.

## Checks

Run from the project root:

```powershell
npx expo lint
npx tsc --noEmit
node --check backend/server.mjs
```
