import pg from "pg";
import { hashPassword } from "./passwords.mjs";

const email = process.env.SEED_EMAIL?.trim().toLowerCase();
const password = process.env.SEED_PASSWORD;

if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Provide a valid SEED_EMAIL.");
}
if (!password || password.length < 8 || Buffer.byteLength(password, "utf8") > 1024) {
  throw new Error("Use a password with at least 15 characters and at most 1024 bytes.");
}

const pool = new pg.Pool({ connectionTimeoutMillis: 5000 });
try {
  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    `INSERT INTO public.users (email, password_hash)
     VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id`,
    [email, passwordHash],
  );
  console.log(result.rowCount ? "Test account created." : "Account already exists; password unchanged.");
} finally {
  await pool.end();
}