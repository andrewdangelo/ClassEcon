#!/usr/bin/env node
/**
 * Quick smoke check: EmailService HTTP health (run against local or Docker URL).
 * Usage: node scripts/smoke.mjs [baseUrl]
 * Example: node scripts/smoke.mjs http://localhost:4004
 */
const base = (process.argv[2] || process.env.EMAIL_SMOKE_URL || "http://127.0.0.1:4004").replace(
  /\/$/,
  ""
);

const run = async () => {
  const url = `${base}/health`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) {
    console.error("FAIL", res.status, text);
    process.exit(1);
  }
  console.log("OK", url, text.slice(0, 200));
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
