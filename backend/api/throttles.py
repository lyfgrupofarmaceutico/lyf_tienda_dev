# throttles.py (crea este archivo en tu app)
from rest_framework.throttling import AnonRateThrottle
from rest_framework.exceptions import Throttled


class PasswordResetRateThrottle(AnonRateThrottle):
    """
    Throttling personalizado para recuperación de contraseña.
    - Mensaje de error más amigable
    - Tiempo de espera en español
    """

    scope = "password_reset"

    def wait(self):
        """Calcular tiempo de espera restante"""
        return super().wait()

    def throttle_failure(self):
        """Personalizar mensaje de error"""
        wait_time = self.wait()

        if wait_time:
            hours = wait_time // 3600
            minutes = (wait_time % 3600) // 60

            if hours > 0:
                message = f"Has excedido el límite de solicitudes. Por favor espera {hours} hora(s) antes de intentar nuevamente."
            elif minutes > 0:
                message = f"Has excedido el límite de solicitudes. Por favor espera {int(minutes)} minuto(s) antes de intentar nuevamente."
            else:
                message = f"Has excedido el límite de solicitudes. Por favor espera {wait_time} segundo(s) antes de intentar nuevamente."
        else:
            message = "Demasiadas solicitudes. Por favor intenta más tarde."

        raise Throttled(wait=wait_time, detail=message)


class ProductoPublicoRateThrottle(AnonRateThrottle):
    """
    Throttling personalizado para vista pública de productos destacados.
    - Límite más permisivo por ser vista de solo lectura con cache
    - Mensajes de error en español con tiempo legible
    """

    scope = "producto_publico"

    def throttle_failure(self):
        """Personalizar mensaje de error"""
        wait_time = self.wait()

        if wait_time:
            hours = wait_time // 3600
            minutes = (wait_time % 3600) // 60

            if hours > 0:
                message = f"Has excedido el límite de consultas. Por favor espera {hours} hora(s) antes de intentar nuevamente."
            elif minutes > 0:
                message = f"Has excedido el límite de consultas. Por favor espera {int(minutes)} minuto(s) antes de intentar nuevamente."
            else:
                message = f"Has excedido el límite de consultas. Por favor espera {wait_time} segundo(s) antes de intentar nuevamente."
        else:
            message = "Demasiadas consultas. Por favor intenta más tarde."

        raise Throttled(wait=wait_time, detail=message)


class PromocionPublicoRateThrottle(AnonRateThrottle):
    """
    Throttling personalizado para vista pública de promociones.
    - Límite más permisivo por ser vista de solo lectura con cache
    - Mensajes de error en español con tiempo legible
    """

    scope = "promocion_publico"

    def throttle_failure(self):
        """Personalizar mensaje de error"""
        wait_time = self.wait()

        if wait_time:
            hours = wait_time // 3600
            minutes = (wait_time % 3600) // 60

            if hours > 0:
                message = f"Has excedido el límite de consultas. Por favor espera {hours} hora(s) antes de intentar nuevamente."
            elif minutes > 0:
                message = f"Has excedido el límite de consultas. Por favor espera {int(minutes)} minuto(s) antes de intentar nuevamente."
            else:
                message = f"Has excedido el límite de consultas. Por favor espera {wait_time} segundo(s) antes de intentar nuevamente."
        else:
            message = "Demasiadas consultas. Por favor intenta más tarde."

        raise Throttled(wait=wait_time, detail=message)


class ContactoRateThrottle(AnonRateThrottle):
    """
    Throttling personalizado para formulario de contacto.
    - Límite estricto para prevenir spam (similar a password_reset)
    - Mensajes de error en español con tiempo legible
    """

    scope = "contacto_publico"

    def throttle_failure(self):
        """Personalizar mensaje de error"""
        wait_time = self.wait()

        if wait_time:
            hours = wait_time // 3600
            minutes = (wait_time % 3600) // 60

            if hours > 0:
                message = f"Has excedido el límite de mensajes. Por favor espera {hours} hora(s) antes de intentar nuevamente."
            elif minutes > 0:
                message = f"Has excedido el límite de mensajes. Por favor espera {int(minutes)} minuto(s) antes de intentar nuevamente."
            else:
                message = f"Has excedido el límite de mensajes. Por favor espera {wait_time} segundo(s) antes de intentar nuevamente."
        else:
            message = "Demasiados intentos. Por favor intenta más tarde."

        raise Throttled(wait=wait_time, detail=message)
