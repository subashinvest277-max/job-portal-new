#!/bin/bash

service nginx start

gunicorn \
--bind 0.0.0.0:8000 \
jobportal.wsgi:application
