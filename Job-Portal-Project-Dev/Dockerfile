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
# Stage 2 - Django Runtime
# =========================
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    libpq-dev \
    pkg-config && \
    rm -rf /var/lib/apt/lists/*

COPY requirement.txt .

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirement.txt

RUN pip install --no-cache-dir \
    gunicorn \
    reportlab \
    razorpay

COPY . .

EXPOSE 8000

CMD ["gunicorn","--bind","0.0.0.0:8000","jobportal.wsgi:application"]
