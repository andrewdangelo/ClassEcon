import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("getting started links resolve to existing frontend routes", () => {
  const routerSource = read("Frontend/src/main.tsx");
  const gettingStartedSource = read("Frontend/src/pages/GettingStartedPage.tsx");

  const routeMatches = [...routerSource.matchAll(/path:\s*"([^"]+)"/g)];
  const routeSet = new Set(routeMatches.map((match) => `/${match[1].replace(/^\//, "")}`));
  routeSet.add("/");

  const linkLiteralMatches = [...gettingStartedSource.matchAll(/(?:link:\s*|to=)"(\/[^"]*)"/g)];
  const links = [...new Set(linkLiteralMatches.map((match) => match[1]))];

  const missing = links.filter((path) => !routeSet.has(path));

  assert.equal(
    missing.length,
    0,
    `Getting Started page contains links without registered routes: ${missing.join(", ")}`
  );
});
