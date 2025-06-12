#!/bin/sh

# This script is executed inside the container on startup

# Exit immediately if a command exits with a non-zero status.
set -e

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# The "exec" command is important to replace the shell process with the Node.js process,
# allowing it to receive signals correctly (like for graceful shutdown).
# "$@" allows us to pass arguments to the script, which will be the CMD from the Dockerfile.
echo "Starting the server..."
exec "$@"