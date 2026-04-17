#!/usr/bin/env node
/**
 * Fails if tracked source files contain high-confidence secret material.
 * Run locally: node scripts/scan-secret-patterns.mjs
 * Intended to complement GitHub push protection (catches issues before push).
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".jsx",
  ".json",
  ".yml",
  ".yaml",
  ".toml",
  ".sh",
  ".bash",
  ".bat",
  ".ps1",
]);

const IGNORE_PATH_PREFIXES = [
  "LandingPage/dist/",
  "admin/dist/",
  "Frontend/dist/",
  "assessment/e2e/artifacts/",
];

/** Lines matching these snippets are treated as documentation / placeholders. */
const SAFE_LINE_MARKERS = [
  "your_",
  "changeme",
  "placeholder",
  "_mock_",
  "mock_",
  "whsec_xxx",
  "sk_test_your",
  "pk_test_your",
  "sk_live_your",
  "pk_live_your",
  "fake_",
  "example_only",
  "xxx",
  "…",
  "...",
];

const RULES = [
  {
    name: "Stripe secret key (sk_…)",
    re: /\bsk_(test|live)_[0-9a-zA-Z]{24,}\b/g,
  },
  {
    name: "Stripe publishable key (pk_…)",
    re: /\bpk_(test|live)_[0-9a-zA-Z]{24,}\b/g,
  },
  {
    name: "Stripe webhook signing secret (whsec_…)",
    re: /\bwhsec_[0-9a-zA-Z]{24,}\b/g,
  },
  {
    name: "AWS access key id (AKIA…)",
    re: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    name: "GitHub PAT (ghp_…)",
    re: /\bghp_[0-9a-zA-Z]{36,}\b/g,
  },
  {
    name: "PEM private key block",
    re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
];

function isSafeLine(line) {
  const lower = line.toLowerCase();
  return SAFE_LINE_MARKERS.some((m) => lower.includes(m.toLowerCase()));
}

function listTrackedFiles() {
  const out = execSync("git ls-files -z", {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return out.split("\0").filter(Boolean);
}

function shouldScanPath(rel) {
  if (IGNORE_PATH_PREFIXES.some((p) => rel.startsWith(p))) return false;
  const i = rel.lastIndexOf(".");
  if (i < 0) return false;
  return EXT.has(rel.slice(i));
}

function main() {
  const hits = [];
  for (const file of listTrackedFiles()) {
    if (!shouldScanPath(file)) continue;
    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (isSafeLine(line)) return;
      for (const { name, re } of RULES) {
        re.lastIndex = 0;
        if (re.test(line)) {
          hits.push({ file, line: idx + 1, rule: name, snippet: line.trim().slice(0, 120) });
        }
      }
    });
  }

  if (hits.length) {
    console.error("Secret-pattern scan failed. Remove real credentials from source; use env vars.\n");
    for (const h of hits) {
      console.error(`  ${h.file}:${h.line}  [${h.rule}]\n    ${h.snippet}\n`);
    }
    process.exit(1);
  }
  console.error("Secret-pattern scan: OK (no high-confidence matches in tracked source).");
}

main();
