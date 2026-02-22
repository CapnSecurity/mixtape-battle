#!/bin/sh
# Production start script - runs migrations then starts the app

echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "Migrations completed successfully"
  echo "Starting Next.js application..."
  node server.js
else
  echo "Migration failed!"
  exit 1
fi
