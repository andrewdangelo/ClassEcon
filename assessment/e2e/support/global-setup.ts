import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.e2e"), override: false });

type HealthTarget = { name: string; url: string };

const requireFrontend = (process.env.E2E_REQUIRE_FRONTEND ?? "true") !== "false";

const targets: HealthTarget[] = [
  ...(requireFrontend
    ? [{ name: "frontend", url: process.env.E2E_FRONTEND_URL ?? "http://localhost:5173" }]
    : []),
  { name: "backend", url: process.env.E2E_BACKEND_HEALTH_URL ?? "http://localhost:4000/health" },
  { name: "payment-service", url: process.env.E2E_PAYMENT_HEALTH_URL ?? "http://localhost:4003/health" },
];

async function waitForHealthyTarget(target: HealthTarget, timeoutMs = 120_000) {
  const started = Date.now();
  let lastError = "unknown error";

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(target.url);
      if (response.ok) {
        return;
      }
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(`Timed out waiting for ${target.name} at ${target.url}: ${lastError}`);
}

export default async function globalSetup() {
  for (const target of targets) {
    await waitForHealthyTarget(target);
  }
}
