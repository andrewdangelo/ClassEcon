// index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "../src/schema";
import { resolvers } from "../src/resolvers";
import { connectMongo } from "./db/connection";
import { authClient } from "./services/auth-client";
import { env } from "./config";
import { initSalaryCronJobs } from "./services/salary";

async function main() {
  console.log("[Startup] Connecting to MongoDB...");
  await connectMongo(env.DATABASE_URL);
  console.log("[Startup] MongoDB connected successfully");
  
  // Initialize salary payment cron jobs
  console.log("[Startup] Initializing cron jobs...");
  initSalaryCronJobs();

  console.log("[Startup] Starting Apollo Server...");
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  console.log("[Startup] Apollo Server started successfully");

  const app = express();
  
  // Health check endpoint for Railway (no auth, no CORS needed)
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Root endpoint for debugging
  app.get("/", (req, res) => {
    res.status(200).json({ 
      message: "ClassEcon Backend API",
      graphql: "/graphql",
      health: "/health"
    });
  });
  
  // Allow multiple origins for CORS from environment configuration
  const allowedOrigins = [
    ...env.CORS_ORIGINS, 
    env.ORIGIN,
    'https://studio.apollographql.com', // Apollo Studio
    'https://sandbox.embed.apollographql.com' // Apollo Sandbox
  ].filter(Boolean);

  app.use(
    "/graphql",
    cors({ 
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // In production, log blocked origins for debugging
          if (env.IS_PRODUCTION) {
            console.log(`[CORS] Blocked origin: ${origin}`);
          }
          callback(null, true); // Allow all origins for now during setup
        }
      },
      credentials: true 
    }),
    cookieParser(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        let userId: string | null = null;
        let role: string | null = null;

        const auth = req.headers.authorization;
        if (auth?.startsWith("Bearer ")) {
          try {
            const payload = await authClient.verifyAccessToken(auth.slice(7));
            userId = payload.sub;
            role = payload.role;
          } catch (error) {
            // Log token verification errors in development
            if (!env.IS_PRODUCTION) {
              console.log('[Auth] Token verification failed:', error);
            }
          }
        }

        if (!userId && (req as any).cookies?.refresh_token) {
          try {
            const r = await authClient.verifyRefreshToken((req as any).cookies.refresh_token);
            const tokens = await authClient.signTokens(r.sub, r.role);
            res.setHeader("x-access-token", tokens.accessToken);
            userId = r.sub;
            role = r.role;
          } catch (error) {
            // Log refresh token errors in development
            if (!env.IS_PRODUCTION) {
              console.log('[Auth] Refresh token verification failed:', error);
            }
          }
        }

        return { userId, role, req, res };
      },
    })
  );

  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`[Startup] Server is now listening on 0.0.0.0:${env.PORT}`);
    console.log(`🚀 GraphQL ready at http://0.0.0.0:${env.PORT}/graphql`);
    console.log(`✓ Health check available at http://0.0.0.0:${env.PORT}/health`);
  });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
