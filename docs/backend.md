# Backend routes and authentication middleware

The Express 5 API is modular as of October 12, 2026. Keep startup in `server.mjs` and feature endpoints in routers.

## File responsibilities

| File | Responsibility |
| --- | --- |
| `backend/server.mjs` | Reads PORT, creates the pool/app, and listens on `0.0.0.0` |
| `backend/app.mjs` | Creates Express, configures CORS/JSON, mounts routers, and registers errors last |
| `backend/db.mjs` | Creates a pg pool with a five-second connection timeout and pool error logging |
| `backend/auth-middleware.mjs` | Bearer parsing, SHA-256 token hashing, and `createRequireAuth(pool)` |
| `backend/routes/auth.routes.mjs` | Login, authenticated current-user endpoint, and logout |
| `backend/routes/health.routes.mjs` | Public database connectivity endpoint |
| `backend/middleware/error-handler.mjs` | JSON parse/size errors and generic server failures |
| `backend/passwords.mjs` | Password hashing and verification |
| `backend/seed-user.mjs` | Local test account creation |

`createApp({ pool })` is asynchronous because the auth router prepares a dummy password hash. CORS uses `WEB_ORIGIN` or `http://localhost:8081`; JSON bodies are limited to 10 KB. The error handler follows all routers, returning 400 for invalid JSON, 413 for oversized JSON, and a generic 500 for other failures. CORS is not authentication.

## Current routes

| Method and path | Authentication and result |
| --- | --- |
| `GET /health` | Public; SELECT 1 yields connected/200 or unavailable/503 |
| `POST /auth/login` | Public credentials endpoint with validation and failed-attempt limiting |
| `GET /auth/me` | `requireAuth`; returns the authenticated account |
| `POST /auth/logout` | Requires a well-formed Bearer token; deletes its hash and returns 204 |

The auth router declares `/login`, `/me`, and `/logout`; `app.mjs` supplies the `/auth` prefix. The health router declares `/`, mounted at `/health`. Do not repeat the mount prefix inside a feature router.

## Session middleware

`createRequireAuth(pool)` returns reusable `requireAuth` middleware:

1. Sets `Cache-Control: no-store`.
2. Reads `Authorization: Bearer <64 lowercase hexadecimal characters>`.
3. Hashes the token and queries sessions joined to users, requiring `expires_at > NOW()`.
4. Returns 401 for missing, malformed, expired, or unknown credentials.
5. Sets `req.user` to `{ id, email }` and calls `next()` for a valid session.

Database failures propagate through Express to the error handler. `/auth/me` uses this middleware; mobile calls that endpoint to restore provider state. Every private API must enforce its own session check even when mobile navigation is guarded.

## Add a future private feature

This example is a pattern for a future route, not an endpoint already implemented. Create `backend/routes/example.routes.mjs`:

```js
import express from "express";

export function createExampleRouter() {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json({ user: req.user });
  });

  return router;
}
```

Import the factory into `app.mjs` and mount it after JSON parsing, before `app.use(errorHandler)`:

```js
app.use("/example", requireAuth, createExampleRouter());
```

The router receives authenticated `req.user`. For a router mixing public/private endpoints, mount it normally and apply `requireAuth` to each private handler, as `/auth/me` does:

```js
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

As features gain database records, use `req.user.id` to enforce record ownership. Session authentication alone does not assign roles or grant module permissions. The current schema and middleware do not implement RBAC.

## Run and verify

From `backend/`, run `npm run dev`; Node loads `.env` and watches imported modules. Routes can be added without changing startup code. See [Setup](setup.md), [Login checks](login.md#10-run-the-checks-and-test), and [syntax verification](troubleshooting.md#verification-commands).
