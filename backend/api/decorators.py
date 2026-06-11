from functools import wraps
from django.views.decorators.cache import cache_page


def cache_page_server_only(timeout, key_prefix=None):
    """
    Cachea la respuesta en el servidor (Redis) pero evita que el navegador la cachee.

    - Mantiene la caché del lado del servidor para mejorar el rendimiento
    - Agrega headers para que el navegador siempre haga la petición
    """

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            # Aplicar cache_page normalmente (cachea en Redis)
            response = cache_page(timeout, key_prefix=key_prefix)(view_func)(
                request, *args, **kwargs
            )

            # Sobrescribir los headers de caché para el navegador
            response["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"

            return response

        return _wrapped_view

    return decorator
