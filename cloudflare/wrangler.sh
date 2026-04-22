#!/usr/bin/env bash
# Thin wrapper that runs the globally-installed wrangler with a Node >= 20
# runtime. The system `node` on this machine is v18.20.8 which wrangler
# refuses to run on, but the Cursor-bundled node is v22 and works fine.
# Use this script (or alias it) in place of the raw `wrangler` command.
set -euo pipefail
NODE_BIN="${CURSOR_NODE:-/c/Users/adang/AppData/Local/Programs/cursor/resources/app/resources/helpers/node.exe}"
WRANGLER_JS="${WRANGLER_JS:-/c/Program Files/nodejs/node_modules/wrangler/bin/wrangler.js}"
exec "$NODE_BIN" "$WRANGLER_JS" "$@"
