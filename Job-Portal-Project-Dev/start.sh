#!/bin/bash

python manage.py migrate

python manage.py collectstatic --noinput

gunicorn \
--bind 127.0.0.1:8000 \
jobportal.wsgi:application &


nginx -g "daemon off;"
