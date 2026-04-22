/**
 * Post-process Playwright JUnit output into a short markdown report for CI and local runs.
 * Run from repo root: pnpm --dir assessment run report:e2e:summary
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const junitPath = path.resolve(__dirname, "../artifacts/junit/results.xml");
const outPath = path.resolve(__dirname, "../artifacts/validation-summary.md");

const lines = [
  "# ClassEcon validation summary",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
];

if (!fs.existsSync(junitPath)) {
  lines.push("No JUnit file found (run Playwright with junit reporter first).");
  lines.push("");
  lines.push(`Expected: \`${path.relative(process.cwd(), junitPath)}\``);
} else {
  const xml = fs.readFileSync(junitPath, "utf8");
  const testcase = (xml.match(/<testcase\b/g) || []).length;
  const failure = (xml.match(/<failure\b/g) || []).length;
  const skipped = (xml.match(/<skipped\b/g) || []).length;
  const passed = Math.max(0, testcase - failure - skipped);

  lines.push(`- **Test cases:** ${testcase} (${passed} passed, ${failure} failed, ${skipped} skipped)`);
  lines.push("- **HTML report:** `assessment/e2e/artifacts/html-report/index.html`");
  lines.push("- **JUnit:** `assessment/e2e/artifacts/junit/results.xml`");
  lines.push("- **Failure traces / screenshots:** `assessment/e2e/artifacts/test-results/`");
  lines.push("");
  lines.push("Debug failures locally: `pnpm exec playwright show-trace <path-to-trace.zip>`");
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(outPath);

const gh = process.env.GITHUB_STEP_SUMMARY;
if (gh) {
  fs.appendFileSync(gh, fs.readFileSync(outPath, "utf8"));
}
