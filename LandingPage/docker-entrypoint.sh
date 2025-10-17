#!/bin/sh
set -e

# Substitute PORT environment variable in nginx config
# If PORT is not set, default to 80
PORT=${PORT:-80}

echo "Starting nginx on port $PORT..."

# Remove any default nginx config that might exist
rm -f /etc/nginx/conf.d/default.conf

# Use sed to replace ${PORT:-80} with actual PORT value
sed "s/\${PORT:-80}/$PORT/g" /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Generated nginx config:"
cat /etc/nginx/conf.d/default.conf | head -10

# Start nginx
exec nginx -g 'daemon off;'
