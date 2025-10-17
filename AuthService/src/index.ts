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

  // Start server - bind to 0.0.0.0 for Railway deployment
  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🔐 Auth Service ready at http://0.0.0.0:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
