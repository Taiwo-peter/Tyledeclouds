#!/bin/bash
set -e

# Initialize database if not exists
if [ ! -d "/var/lib/mysql/mysql" ]; then
    mysql_install_db --user=mysql --ldata=/var/lib/mysql
fi

# Start temporary server
mysqld_safe --user=mysql --skip-networking &
MYSQL_PID=$!

# Wait for server start
until mysqladmin ping 2>/dev/null; do
    sleep 1
done

# Create database and user
mysql -uroot <<EOSQL
    CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;
    CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
    GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
    ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
EOSQL

# Shutdown temporary server
mysqladmin -uroot -p${MYSQL_ROOT_PASSWORD} shutdown

# Start production server
exec mysqld_safe --user=mysql