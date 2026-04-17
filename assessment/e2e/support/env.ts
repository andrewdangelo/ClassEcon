import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.e2e"), override: false });

export const E2E_ENV = {
  frontendUrl: process.env.E2E_FRONTEND_URL ?? "http://localhost:5173",
  graphqlUrl: process.env.E2E_GRAPHQL_URL ?? "http://localhost:4000/graphql",
  betaCode: process.env.E2E_BETA_CODE ?? "E2EACCESS",
  defaultPassword: process.env.E2E_DEFAULT_PASSWORD ?? "Password123!",
  billingMode: process.env.E2E_BILLING_MODE ?? "mock",
};
