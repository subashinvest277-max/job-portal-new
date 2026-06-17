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
# Stage 2 - Python + Nginx
# =========================

FROM python:3.11-slim


WORKDIR /app


RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nginx \
    gcc \
    default-libmysqlclient-dev \
    libpq-dev \
    pkg-config && \
    rm -rf /var/lib/apt/lists/*


COPY requirements.txt .


RUN pip install --upgrade pip


RUN pip install --no-cache-dir -r requirements.txt


RUN pip install --no-cache-dir \
    gunicorn \
    reportlab \
    razorpay



COPY . .


# Copy React production build
COPY --from=frontend-builder /frontend/build /app/frontend/build



# Nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf



EXPOSE 80


COPY start.sh /start.sh

RUN chmod +x /start.sh


CMD ["/start.sh"]
