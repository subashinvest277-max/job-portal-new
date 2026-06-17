#!/bin/bash

echo "Running migrations"

python manage.py migrate


echo "Collecting static files"

python manage.py collectstatic --noinput


echo "Starting Gunicorn"


gunicorn jobportal.wsgi:application \
--bind 127.0.0.1:8000 \
--workers 3 &



echo "Starting Nginx"


nginx -g "daemon off;"
