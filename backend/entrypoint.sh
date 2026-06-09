#!/bin/bash

# entrypoint.sh - Script de entrada para el contenedor del backend

set -e

echo "🚀 Iniciando backend..."

# Esperar a que PostgreSQL esté disponible (si está configurado)
if [ -n "$DATABASE_URL" ]; then
    echo "⏳ Esperando a que la base de datos esté disponible..."
    until python -c "import psycopg2; psycopg2.connect('$DATABASE_URL')" 2>/dev/null; do
        echo "   Base de datos no disponible, esperando..."
        sleep 2
    done
    echo "✅ Base de datos conectada"
fi

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
python manage.py migrate --noinput

# Recopilar archivos estáticos (para producción)
echo "📁 Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

# Crear superusuario si no existe (solo si las variables están configuradas)
if [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "👤 Creando superusuario..."
    python manage.py createsuperuser --noinput 2>/dev/null || echo "   El superusuario ya existe"
fi

echo "✅ Backend listo para iniciar"

# Ejecutar el comando pasado (por defecto gunicorn)
exec "$@"
