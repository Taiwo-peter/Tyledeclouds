#!/bin/sh
# Wait for database to be ready
while ! mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -h db -e "SELECT 1"; do
  echo "Waiting for database..."
  sleep 2
done

# Start application
exec "$@"