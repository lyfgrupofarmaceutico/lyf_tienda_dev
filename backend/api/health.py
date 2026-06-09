"""
Health Check Views - Endpoints para monitoreo de salud del servidor
"""
from django.http import JsonResponse
from django.db import connection
from django.db.utils import OperationalError
import datetime


def health_check(request):
    """
    Health check básico - verifica que el servidor esté corriendo

    GET /api/health/

    Response:
    {
        "status": "healthy",
        "timestamp": "2024-01-01T12:00:00Z"
    }
    """
    return JsonResponse({
        "status": "healthy",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "service": "lyf-backend"
    })


def health_check_full(request):
    """
    Health check completo - verifica servidor + base de datos

    GET /api/health/full/

    Response (exitoso):
    {
        "status": "healthy",
        "database": "connected",
        "timestamp": "2024-01-01T12:00:00Z"
    }

    Response (error):
    {
        "status": "unhealthy",
        "database": "disconnected",
        "error": "Connection refused",
        "timestamp": "2024-01-01T12:00:00Z"
    }
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "service": "lyf-backend",
        "checks": {}
    }

    # Check de base de datos
    try:
        connection.ensure_connection()
        health_status["checks"]["database"] = {
            "status": "connected",
            "vendor": connection.vendor,
        }
    except OperationalError as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "disconnected",
            "error": str(e),
        }

    # Determinar código de estado HTTP
    status_code = 200 if health_status["status"] == "healthy" else 503

    return JsonResponse(health_status, status=status_code)
