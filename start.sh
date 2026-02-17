#!/bin/sh
cd /app/backend && node server.js &
exec nginx -g "daemon off;"
