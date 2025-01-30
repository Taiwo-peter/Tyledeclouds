#!/bin/bash
set -e

# Initialize database if not exists
if [ ! -d "/var/lib/mysql/mysql" ]; then
  mysql_install_db --user=mysql --datadir=/var/lib/mysql
  
  # Start temporary DB instance
  mysqld_safe --user=mysql --datadir=/var/lib/mysql --skip-networking &
  
  # Wait for DB to start
  timeout 30s bash -c 'until mysqladmin ping -u root --silent; do sleep 1; done'
  
  # Secure installation
  mysql -u root <<-EOSQL
    ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
    DELETE FROM mysql.user WHERE User='';
    DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
    CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};
    CREATE USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
    GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL
  
  # Shutdown temporary instance
  mysqladmin -u root -p${MYSQL_ROOT_PASSWORD} shutdown
fi

# Start production instance
exec mysqld_safe --user=mysql --datadir=/var/lib/mysql