import cors from "cors";
import express from "express";
import { createRequireAuth } from "./auth-middleware.mjs";
import { errorHandler } from "./middleware/error-handler.mjs";
import { createAuthRouter } from "./routes/auth.routes.mjs";
import { createHealthRouter } from "./routes/health.routes.mjs";

export async function createApp({ pool }) {
  const app = express();
  const requireAuth = createRequireAuth(pool);

  app.use(
    cors({
      origin: process.env.WEB_ORIGIN ?? "http://localhost:8081",
    }),
  );

  app.use(express.json({ limit: "10kb" }));

  // Public health endpoint.
  app.use("/health", createHealthRouter({ pool }));

  // Authentication endpoints; /me has its own auth middleware.
  const authRouter = await createAuthRouter({
    pool,
    requireAuth,
  });

  app.use("/auth", authRouter);

  // Register the error handler after all routers.
  app.use(errorHandler);

  return app;
}