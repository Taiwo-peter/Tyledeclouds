#!/bin/bash
set -e

# Initialize database
if [ ! -d "/var/lib/mysql/mysql" ]; then
  mysql_install_db --user=mysql --datadir=/var/lib/mysql
  
  # Start temporary DB instance
  mysqld_safe --user=mysql --datadir=/var/lib/mysql --skip-networking &
  
  # Wait for DB to start
  timeout 30s bash -c 'until mysqladmin ping -u root --silent; do sleep 1; done'
  
  # Configure database
  mysql -u root <<-EOSQL
    ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
    CREATE USER 'root'@'%' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
    GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
    CREATE DATABASE ${MYSQL_DATABASE};
    CREATE USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
    GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL
  
  # Shutdown temporary instance
  mysqladmin -u root -p${MYSQL_ROOT_PASSWORD} shutdown
fi

# Start production instance with TCP support
exec mysqld_safe --user=mysql --datadir=/var/lib/mysql --bind-address=0.0.0.0