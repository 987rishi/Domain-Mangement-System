#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "Attempting to restore database from UserManagementMicroservice_backup.dump..."

# Use pg_restore to import the custom-format dump.
# Environment variables like POSTGRES_USER and POSTGRES_DB are set by the
# official postgres image entrypoint based on docker-compose environment vars.
pg_restore \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" \
    --verbose \
    --no-owner \
    --no-privileges \
    --single-transaction \
    /docker-entrypoint-initdb.d/UserManagementMicroservice_backup.dump

echo "Database restore completed."