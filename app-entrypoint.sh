while ! nc -z db 3306; do
  echo "Waiting for database..."
  sleep 2
done
# Start the application
exec ./your-app