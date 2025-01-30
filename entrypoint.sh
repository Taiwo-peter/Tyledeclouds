#!/bin/bash
set -e

# Initialize database if not exists
if [ ! -d "/var/lib/mysql/mysql" ]; then
  echo "Initializing database..."
  mysql_install_db --user=mysql --datadir=/var/lib/mysql
fi

# Start MariaDB
exec mysqld_safe --user=mysql --datadir=/var/lib/mysql