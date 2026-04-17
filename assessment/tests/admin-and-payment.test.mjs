import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("admin dashboard query options block is syntactically intact", () => {
  const dashboardSource = read("admin/src/pages/DashboardPage.tsx");

  assert.doesNotMatch(
    dashboardSource,
    /fetcsubscriptionStats/,
    "Dashboard page contains a broken query options block (`fetcsubscriptionStats` typo) that prevents TypeScript compilation"
  );
});

test("payment service auth middleware supports GET routes", () => {
  const authSource = read("PaymentService/src/middleware/auth.ts");

  assert.doesNotMatch(
    authSource,
    /const\s+\{\s*userId,\s*userRole\s*\}\s*=\s*req\.body/,
    "requireServiceAuth currently depends on req.body for userId, which is unreliable for GET endpoints"
  );
});
