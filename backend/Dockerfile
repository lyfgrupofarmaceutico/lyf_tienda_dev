# Backend Dockerfile - Django + Gunicorn
FROM python:3.12-slim

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema (libjpeg-dev y zlib-dev son necesarios para Pillow)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero (mejor cache)
COPY requirements.txt /app/requirements.txt

# Instalar dependencias de Python
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install gunicorn psycopg2-binary

# Copiar el resto del código
COPY . .

# Crear directorio para archivos media
RUN mkdir -p /app/media /app/staticfiles

# Crear usuario no root para seguridad
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

# Dar permisos de ejecución al script
RUN chmod +x /app/entrypoint.sh

USER appuser

# Puerto
EXPOSE 8000

# Entry point
ENTRYPOINT ["/app/entrypoint.sh"]

# Comando por defecto
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "4", "tienda.wsgi:application"]
