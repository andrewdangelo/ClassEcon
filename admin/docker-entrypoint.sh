#!/bin/sh

# Replace environment variables at runtime
# This allows the container to receive env vars at runtime

# Find all JS files and replace placeholders
for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    # Replace __VITE_GRAPHQL_URL__ placeholder with actual env var
    sed -i "s|__VITE_GRAPHQL_URL__|${VITE_GRAPHQL_URL:-http://localhost:4000/graphql}|g" $file
  fi
done

exec "$@"
