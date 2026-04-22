// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config.js";
import { paymentRouter } from "./routes/payments.js";
import { webhookRouter } from "./routes/webhooks.js";
import { adminRouter } from "./routes/admin.js";
import { connectDatabase } from "./db/connection.js";

async function main() {
  const app = express();
  // Cloudflare Containers terminates TLS upstream; trust forwarded headers.
  app.set("trust proxy", 1);

  // Health check endpoint (no auth needed)
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "payment-service",
      timestamp: new Date().toISOString(),
    });
  });

  // Root endpoint
  app.get("/", (_req, res) => {
    res.status(200).json({
      message: "ClassEcon Payment Service",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        payments: "/api/payments",
        webhooks: "/webhooks",
        admin: "/api/admin",
      },
    });
  });

  // Webhook routes MUST be before body parsing middleware
  // Stripe requires raw body for signature verification
  app.use("/webhooks", webhookRouter);

  // CORS and JSON parsing for other routes
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          if (!env.IS_PRODUCTION) {
            console.log(`[CORS] Allowing origin in dev: ${origin}`);
          }
          callback(null, true); // Allow all in development
        }
      },
      credentials: true,
    })
  );
  app.use(express.json());

  // Payment routes
  app.use("/api/payments", paymentRouter);

  // Admin routes (for customer support)
  app.use("/api/admin", adminRouter);

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[Error]", err);
    res.status(500).json({
      error: "Internal server error",
      message: env.IS_PRODUCTION ? "Something went wrong" : err.message,
    });
  });

  // Start server before connecting to Mongo so the TCP port opens immediately
  // (Cloudflare Containers requires the port to be listening to route traffic).
  const host = env.IS_PRODUCTION ? "0.0.0.0" : "localhost";
  app.listen(env.PORT, host, () => {
    console.log(`💳 Payment Service ready at http://${host}:${env.PORT}`);
  });

  if (env.DATABASE_URL) {
    connectDatabase()
      .then(() => console.log("[Startup] MongoDB connected successfully"))
      .catch((err) => console.error("[Startup] MongoDB connection failed:", err));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
