import cors from "cors";
import express from "express";
import pg from "pg";

const { Pool } = pg;

const app = express();
const port = Number(process.env.PORT ?? 3000);

const pool = new Pool({
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Database pool error:", error.message);
});

app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:8081",
  }),
);

app.use(express.json({ limit: "10kb" }));

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`API running at http://localhost:${port}`);
});