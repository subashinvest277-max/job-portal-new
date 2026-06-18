DOCKERFILE EXPLANATION
======================
# =========================
# Stage 1 - React Build
# =========================

FROM node:22 AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ .

RUN npm run build

# =========================
# Stage 2 - Django + Nginx
# =========================

FROM python:3.11-slim

WORKDIR /app

# Install Nginx and system dependencies

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nginx \
    gcc \
    default-libmysqlclient-dev \
    libpq-dev \
    pkg-config && \
    rm -rf /var/lib/apt/lists/*

# Install Python packages

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Production packages

RUN pip install --no-cache-dir \
    gunicorn \
    reportlab \
    razorpay

# Copy Django project

COPY . /app

# Copy React build to nginx web root

COPY --from=frontend-builder \
/frontend/dist \
/var/www/html

# Copy nginx configuration

COPY nginx/default.conf \
/etc/nginx/sites-available/default

# Remove default nginx conf if exists

RUN rm -f /etc/nginx/conf.d/default.conf

# Copy start script

COPY start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 80





CMD ["/start.sh"]

