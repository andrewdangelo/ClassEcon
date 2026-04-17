import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("submitPayRequest enforces auth and teacher authorization", () => {
  const mutationSource = read("Backend/src/resolvers/Mutation.ts");
  const functionStart = mutationSource.indexOf("async submitPayRequest");
  assert.notEqual(
    functionStart,
    -1,
    "Could not locate submitPayRequest resolver implementation"
  );

  const functionEnd = mutationSource.indexOf("async rebukePayRequest", functionStart);
  assert.notEqual(
    functionEnd,
    -1,
    "Could not determine submitPayRequest resolver bounds"
  );

  const submitPayRequestSource = mutationSource.slice(functionStart, functionEnd);

  assert.match(
    submitPayRequestSource,
    /requireAuth\(ctx\)/,
    "submitPayRequest should require an authenticated user"
  );

  assert.match(
    submitPayRequestSource,
    /requireClassTeacher\(ctx,\s*req\.classId\.toString\(\)\)/,
    "submitPayRequest should require teacher access to the request class"
  );
});

test("backend payment client uses payment-service route contract", () => {
  const clientSource = read("Backend/src/services/payment-service.ts");

  assert.doesNotMatch(
    clientSource,
    /\/api\/payments\/subscription\/\$\{userId\}/,
    "PaymentServiceClient should call /api/payments/subscription (userId in auth context/body), not a userId path segment"
  );

  assert.doesNotMatch(
    clientSource,
    /\/api\/payments\/invoices\/\$\{userId\}/,
    "PaymentServiceClient should call /api/payments/invoices (userId in auth context/body), not a userId path segment"
  );

  assert.doesNotMatch(
    clientSource,
    /\/api\/payments\/payment-methods\/\$\{userId\}/,
    "PaymentServiceClient should call /api/payments/payment-methods (userId in auth context/body), not a userId path segment"
  );

  assert.match(
    clientSource,
    /\/api\/payments\/cancel/,
    "PaymentServiceClient should use /api/payments/cancel for subscription cancellation"
  );

  assert.match(
    clientSource,
    /\/api\/payments\/reactivate/,
    "PaymentServiceClient should use /api/payments/reactivate for subscription reactivation"
  );
});
