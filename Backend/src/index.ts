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
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from "./auth";
import { env } from "./config";
import { initSalaryCronJobs } from "./services/salary";

async function main() {
  await connectMongo(env.DATABASE_URL);
  
  // Initialize salary payment cron jobs
  initSalaryCronJobs();

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();
  app.use(
    "/graphql",
    cors({ origin: env.ORIGIN, credentials: true }),
    cookieParser(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        let userId: string | null = null;
        let role: string | null = null;

        const auth = req.headers.authorization;
        if (auth?.startsWith("Bearer ")) {
          try {
            const payload = verifyAccessToken(auth.slice(7));
            userId = payload.sub;
            role = payload.role;
          } catch {}
        }

        if (!userId && (req as any).cookies?.refresh_token) {
          try {
            const r = verifyRefreshToken((req as any).cookies.refresh_token);
            const newAccess = signAccessToken(r.sub, r.role);
            res.setHeader("x-access-token", newAccess);
            userId = r.sub;
            role = r.role;
          } catch {}
        }

        return { userId, role, req, res };
      },
    })
  );

  app.listen(env.PORT, () => {
    console.log(`🚀 GraphQL ready at http://localhost:${env.PORT}/graphql`);
  });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
