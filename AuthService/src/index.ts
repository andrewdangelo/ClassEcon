// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware";

async function main() {
  const app = express();

  // Middleware
  app.use(cors({ 
    origin: env.CORS_ORIGIN, 
    credentials: true 
  }));
  app.use(cookieParser());
  app.use(express.json());

  // Routes
  app.use("/", routes);

  // Error handling
  app.use(errorHandler);

  // Start server - bind to localhost in dev, 0.0.0.0 in production for Railway
  const host = env.NODE_ENV === "development" ? "localhost" : "0.0.0.0";
  
  app.listen(env.PORT, host, () => {
    console.log(`🔐 Auth Service ready at http://${host}:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
