#!/bin/bash
set -e

# Perform the restore
pg_restore --verbose --clean --if-exists --no-acl --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB" /docker-entrypoint-initdb.d/user_management_db.dump