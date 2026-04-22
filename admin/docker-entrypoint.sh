#!/bin/sh
set -e

# Substitute runtime PORT into the nginx server config before starting nginx.
PORT=${PORT:-8080}
echo "Starting nginx on port $PORT..."

# Runtime VITE_GRAPHQL_URL substitution in the built JS bundle, if needed.
for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    sed -i "s|__VITE_GRAPHQL_URL__|${VITE_GRAPHQL_URL:-http://localhost:4000/graphql}|g" "$file"
  fi
done

# Rewrite the nginx config with the resolved port.
sed "s/\${PORT:-8080}/$PORT/g" /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

exec "$@"
