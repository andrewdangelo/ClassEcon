#!/usr/bin/env bash
# run-services.sh - try to open each service in a new terminal and run their dev scripts
ROOT="$(cd "$(dirname "$0")" && pwd)"

services=("admin" "AuthService" "Backend" "EmailService" "Frontend" "LandingPage" "PaymentService")

echo "Starting services from $ROOT"

for s in "${services[@]}"; do
  if [ -d "$ROOT/$s" ]; then
    CMD="cd \"$ROOT/$s\" && pnpm dev || npm run dev || npm start; exec bash"
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
      # On Windows Git Bash/Cygwin, use 'start' to open a new command prompt
      # We use 'pnpm', 'npm' directly since they should be in the PATH
      start cmd /k "cd /d \"$(cygpath -w "$ROOT/$s")\" && (pnpm dev || npm run dev || npm start || echo 'Failed to start service')"
    elif command -v gnome-terminal >/dev/null 2>&1; then
      gnome-terminal -- bash -c "$CMD"
    elif command -v konsole >/dev/null 2>&1; then
      konsole -e bash -c "$CMD"
    elif command -v xfce4-terminal >/dev/null 2>&1; then
      xfce4-terminal --command="bash -c '$CMD'"
    elif command -v xterm >/dev/null 2>&1; then
      xterm -hold -e "bash -c '$CMD'" &
    else
      echo "No supported terminal found for $s — run: cd $ROOT/$s && pnpm dev"
    fi
  else
    echo "Skipping $s: directory not found"
  fi
done

echo "Launched all available services (where possible)."
