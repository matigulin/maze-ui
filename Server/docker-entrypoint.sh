#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  node ./node_modules/sequelize-cli/lib/sequelize db:migrate --env production
fi

exec node dist/server.js
