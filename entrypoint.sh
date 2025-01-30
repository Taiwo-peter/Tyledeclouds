#!/bin/bash
set -e

# Initialize database if not already initialized
if [ ! -d "/var/lib/mysql/mysql" ]; then
    mysql_install_db --user=mysql --datadir=/var/lib/mysql
fi

# Start MariaDB
exec mysqld_safe --user=mysql --datadir=/var/lib/mysql
