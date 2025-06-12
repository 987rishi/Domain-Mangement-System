#!/bin/sh

# This script is executed when the Docker container starts.

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the server..."
# The "exec" command is important to ensure that the Node.js process
# becomes the main process (PID 1) in the container, allowing it to
# receive signals like SIGTERM correctly for graceful shutdowns.
exec "$@"