#!/bin/sh
set -e

# Substitute PORT environment variable in nginx config
# If PORT is not set, default to 80
export PORT=${PORT:-80}

echo "Starting nginx on port $PORT..."

# Use envsubst to replace ${PORT} in the template
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
