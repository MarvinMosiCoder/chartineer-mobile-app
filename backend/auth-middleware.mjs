import { createHash } from "node:crypto";

export function readToken(req) {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(
    req.get("Authorization") ?? "",
  );

  return match?.[1] ?? null;
}

export function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function createRequireAuth(pool) {
  return async function requireAuth(req, res, next) {
    res.set("Cache-Control", "no-store");

    const token = readToken(req);

    if (!token) {
      return res.status(401).json({
        message: "Please sign in.",
      });
    }

    const result = await pool.query(
      `SELECT u.id::text, u.email
       FROM public.sessions s
       JOIN public.users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [tokenHash(token)],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Your session has expired. Please sign in again.",
      });
    }

    // Make the authenticated account available to the route.
    req.user = user;

    // Continue to the route handler.
    next();
  };
}