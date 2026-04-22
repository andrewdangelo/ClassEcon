import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.e2e"), override: false });

export const E2E_ENV = {
  frontendUrl: process.env.E2E_FRONTEND_URL ?? "http://localhost:5173",
  graphqlUrl: process.env.E2E_GRAPHQL_URL ?? "http://localhost:4000/graphql",
  /** Base URL for REST internal routes (e.g. /api/internal/subscription-update) */
  backendBaseUrl:
    process.env.E2E_BACKEND_URL ??
    (process.env.E2E_GRAPHQL_URL ?? "http://localhost:4000/graphql").replace(/\/graphql\/?$/, ""),
  /** Must match Backend INTERNAL_API_KEY when NODE_ENV=production (see docker-compose). */
  internalApiKey: process.env.E2E_INTERNAL_API_KEY ?? "e2e-dev-internal-key",
  betaCode: process.env.E2E_BETA_CODE ?? "E2EACCESS",
  defaultPassword: process.env.E2E_DEFAULT_PASSWORD ?? "Password123!",
  billingMode: process.env.E2E_BILLING_MODE ?? "mock",
};
