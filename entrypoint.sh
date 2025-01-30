#!/bin/sh

# Ensure MySQL data directory is initialized
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing database..."
    mysql_install_db --user=mysql --datadir=/var/lib/mysql > /dev/null
fi

# Start MariaDB service in the background
exec mysqld --user=mysql --datadir=/var/lib/mysql
