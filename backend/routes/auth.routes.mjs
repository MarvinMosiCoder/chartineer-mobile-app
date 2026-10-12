import express from "express";
import { rateLimit } from "express-rate-limit";
import { randomBytes } from "node:crypto";
import {
    readToken,
    tokenHash,
} from "../auth-middleware.mjs";
import {
    hashPassword,
    verifyPassword,
} from "../passwords.mjs";

export async function createAuthRouter({ pool, requireAuth }) {
  const router = express.Router();

  const dummyHash = await hashPassword(
    randomBytes(32).toString("hex"),
  );

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: "Too many login attempts. Try again in 15 minutes.",
    },
  });

  router.post("/login", loginLimiter, async (req, res) => {
    const emailInput = req.body?.email;
    const password = req.body?.password;

    if (
      typeof emailInput !== "string" ||
      typeof password !== "string" ||
      emailInput.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim()) ||
      password.length === 0 ||
      Buffer.byteLength(password, "utf8") > 1024
    ) {
      return res.status(400).json({
        message: "Enter a valid email and password.",
      });
    }

    const email = emailInput.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id::text, email, password_hash
       FROM public.users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email],
    );

    const user = result.rows[0];

    // Unknown accounts still perform a password comparison.
    const valid = await verifyPassword(
      password,
      user?.password_hash ?? dummyHash,
    );

    if (!user || !valid) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    await pool.query(
      `DELETE FROM public.sessions
       WHERE user_id = $1 AND expires_at <= NOW()`,
      [user.id],
    );

    await pool.query(
      `INSERT INTO public.sessions
       (token_hash, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [tokenHash(token), user.id, expiresAt],
    );

    res.set("Cache-Control", "no-store");

    res.json({
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });

  router.get("/me", requireAuth, (req, res) => {
    res.json({
      user: req.user,
    });
  });

  router.post("/logout", async (req, res) => {
    const token = readToken(req);

    if (!token) {
      return res.status(401).json({
        message: "Please sign in.",
      });
    }

    await pool.query(
      "DELETE FROM public.sessions WHERE token_hash = $1",
      [tokenHash(token)],
    );

    res.sendStatus(204);
  });

  return router;
}