import express from "express";

export function createHealthRouter({ pool }) {
  const router = express.Router();

  router.get("/", async (_req, res) => {
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

  return router;
}