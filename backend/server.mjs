import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { createHash, randomBytes } from "node:crypto";
import pg from "pg";
import { hashPassword, verifyPassword } from "./passwords.mjs";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const pool = new pg.Pool({ connectionTimeoutMillis: 5000 });
const dummyHash = await hashPassword(randomBytes(32).toString("hex"));

pool.on("error", (error) => console.error("Database pool error:", error.message));
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:8081" }));
app.use(express.json({ limit: "10kb" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
});

function readToken(req) {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(req.get("Authorization") ?? "");
  return match?.[1] ?? null;
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.post("/auth/login", loginLimiter, async (req, res) => {
  const emailInput = req.body?.email;
  const password = req.body?.password;
  if (
    typeof emailInput !== "string" || typeof password !== "string" ||
    emailInput.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim()) ||
    password.length === 0 || Buffer.byteLength(password, "utf8") > 1024
  ) return res.status(400).json({ message: "Enter a valid email and password." });

  const email = emailInput.trim().toLowerCase();
  const result = await pool.query(
    `SELECT id::text, email, password_hash FROM public.users
     WHERE LOWER(email) = $1 LIMIT 1`,
    [email],
  );
  const user = result.rows[0];
  // Unknown accounts still perform a password hash comparison.
  const valid = await verifyPassword(password, user?.password_hash ?? dummyHash);
  if (!user || !valid) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    "DELETE FROM public.sessions WHERE user_id = $1 AND expires_at <= NOW()",
    [user.id],
  );
  await pool.query(
    "INSERT INTO public.sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [tokenHash(token), user.id, expiresAt],
  );
  res.set("Cache-Control", "no-store");
  res.json({ token, expiresAt: expiresAt.toISOString(), user: { id: user.id, email: user.email } });
});

app.get("/auth/me", async (req, res) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: "Please sign in." });

  const result = await pool.query(
    `SELECT u.id::text, u.email FROM public.sessions s
     JOIN public.users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [tokenHash(token)],
  );
  if (!result.rows[0]) {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
  res.set("Cache-Control", "no-store");
  res.json({ user: result.rows[0] });
});

app.post("/auth/logout", async (req, res) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: "Please sign in." });
  await pool.query("DELETE FROM public.sessions WHERE token_hash = $1", [tokenHash(token)]);
  res.sendStatus(204);
});

app.use((error, _req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Send a valid JSON request." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request is too large." });
  }
  console.error("API error:", error.message);
  res.status(500).json({ message: "The server could not complete the request. Try again." });
});

app.listen(port, "0.0.0.0", () => console.log(`API running at http://localhost:${port}`));