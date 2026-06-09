from django.core.cache import cache
from django.db.models.signals import post_save, post_delete, pre_save, pre_delete
from django.dispatch import receiver
from .models import Portafolio, Producto, Promocion, Curso


# ==================================
# GESTIÓN DE ARCHIVOS (Portafolio)
# ==================================
@receiver(pre_save, sender=Portafolio)
def eliminar_archivos_antiguos_portafolio(sender, instance, **kwargs):
    """Elimina archivos antiguos cuando se reemplazan o se dejan vacíos."""
    if not instance.pk:
        return  # Es una creación nueva, no hay archivos previos

    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    for field_name in ["logo", "banner", "catalogo_pdf"]:
        old_file = getattr(old_instance, field_name)
        new_file = getattr(instance, field_name)

        # Si existe un archivo viejo y cambió de nombre o fue eliminado
        if (
            old_file
            and old_file.name
            and (not new_file or not new_file.name or old_file.name != new_file.name)
        ):
            try:
                old_file.delete(save=False)  # save=False evita recursión infinita
            except Exception:
                pass  # El archivo ya no existía en disco, ignoramos el error


@receiver(pre_delete, sender=Portafolio)
def eliminar_archivos_al_borrar_portafolio(sender, instance, **kwargs):
    """Elimina todos los archivos asociados antes de borrar el registro de BD."""
    for field_name in ["logo", "banner", "catalogo_pdf"]:
        file_obj = getattr(instance, field_name)
        if file_obj and file_obj.name:
            try:
                file_obj.delete(save=False)
            except Exception:
                pass


# ==================================
# GESTIÓN DE ARCHIVOS (Producto)
# ==================================
@receiver(pre_save, sender=Producto)
def eliminar_archivos_antiguos_producto(sender, instance, **kwargs):
    """Elimina archivos antiguos cuando se reemplazan o se dejan vacíos."""
    if not instance.pk:
        return  # Es una creación nueva, no hay archivos previos

    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    for field_name in ["img"]:
        old_file = getattr(old_instance, field_name)
        new_file = getattr(instance, field_name)

        # Si existe un archivo viejo y cambió de nombre o fue eliminado
        if (
            old_file
            and old_file.name
            and (not new_file or not new_file.name or old_file.name != new_file.name)
        ):
            try:
                old_file.delete(save=False)  # save=False evita recursión infinita
            except Exception:
                pass  # El archivo ya no existía en disco, ignoramos el error


@receiver(pre_delete, sender=Producto)
def eliminar_archivos_al_borrar_producto(sender, instance, **kwargs):
    """Elimina todos los archivos asociados antes de borrar el registro de BD."""
    for field_name in ["img"]:
        file_obj = getattr(instance, field_name)
        if file_obj and file_obj.name:
            try:
                file_obj.delete(save=False)
            except Exception:
                pass


# ==================================
# GESTIÓN DE ARCHIVOS (Curso)
# ==================================
@receiver(pre_save, sender=Curso)
def eliminar_archivos_antiguos_curso(sender, instance, **kwargs):
    """Elimina archivos antiguos cuando se reemplazan o se dejan vacíos."""
    if not instance.pk:
        return  # Es una creación nueva, no hay archivos previos

    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    for field_name in ["img"]:
        old_file = getattr(old_instance, field_name)
        new_file = getattr(instance, field_name)

        # Si existe un archivo viejo y cambió de nombre o fue eliminado
        if (
            old_file
            and old_file.name
            and (not new_file or not new_file.name or old_file.name != new_file.name)
        ):
            try:
                old_file.delete(save=False)  # save=False evita recursión infinita
            except Exception:
                pass  # El archivo ya no existía en disco, ignoramos el error


@receiver(pre_delete, sender=Curso)
def eliminar_archivos_al_borrar_curso(sender, instance, **kwargs):
    """Elimina todos los archivos asociados antes de borrar el registro de BD."""
    for field_name in ["img"]:
        file_obj = getattr(instance, field_name)
        if file_obj and file_obj.name:
            try:
                file_obj.delete(save=False)
            except Exception:
                pass


# ==================================
# GESTIÓN DE ARCHIVOS (Promocion)
# ==================================
@receiver(pre_save, sender=Promocion)
def eliminar_archivos_antiguos_promocion(sender, instance, **kwargs):
    """Elimina archivos antiguos cuando se reemplazan o se dejan vacíos."""
    if not instance.pk:
        return  # Es una creación nueva, no hay archivos previos

    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    for field_name in ["banner"]:
        old_file = getattr(old_instance, field_name)
        new_file = getattr(instance, field_name)

        # Si existe un archivo viejo y cambió de nombre o fue eliminado
        if (
            old_file
            and old_file.name
            and (not new_file or not new_file.name or old_file.name != new_file.name)
        ):
            try:
                old_file.delete(save=False)  # save=False evita recursión infinita
            except Exception:
                pass  # El archivo ya no existía en disco, ignoramos el error


@receiver(pre_delete, sender=Promocion)
def eliminar_archivos_al_borrar_promocion(sender, instance, **kwargs):
    """Elimina todos los archivos asociados antes de borrar el registro de BD."""
    for field_name in ["banner"]:
        file_obj = getattr(instance, field_name)
        if file_obj and file_obj.name:
            try:
                file_obj.delete(save=False)
            except Exception:
                pass


# ==========================
# LIMPIEZA DE CACHE
# ==========================


# Eliminar chaché por prefijos
def _delete_cache_by_prefix(prefix: str):
    """Elimina claves por prefijo con fallback para backends locales"""
    try:
        # En produccion limpiar lo chaché necesaria - Redis
        cache.delete_pattern(f"{prefix}*")
    except (AttributeError, NotImplementedError):
        # En desarrollo limpiar todo el caché local - LocMemCache
        cache.clear()


# Limpiar chache PORTAFOLIOS PUBLICOS al momento de un cambio
@receiver([post_save, post_delete], sender=Portafolio)
def clear_portafolio_cache(sender, instance, **kwargs):
    print("Se ejecuto la limpieza para la vista PORTAFOLIOS")
    _delete_cache_by_prefix("portafolio_cache")
    # También limpiamos productos porque el portafolio los incluye anidados
    print("Se ejecuto la limpieza para la vista PRODUCTOS")
    _delete_cache_by_prefix("producto_cache")


# Limpiar chache de PRODUCTOS PUBLICOS al momento de un cambio
@receiver([post_save, post_delete], sender=Producto)
def clear_producto_cache(sender, instance, **kwargs):
    print("Se ejecuto la limpieza para la vista PRODUCTOS")
    _delete_cache_by_prefix("producto_cache")
    # Y actualizamos portafolios porque muestran productos
    print("Se ejecuto la limpieza para la vista PORTAFOLIOS")
    _delete_cache_by_prefix("portafolio_cache")


# Limpiar chache de PROMOCIONES PUBLICAS al momento de un cambio
@receiver([post_save, post_delete], sender=Promocion)
def clear_promocion_cache(sender, instance, **kwargs):
    print("Se ejecuto la limpieza para la vista PROMOCIONES")
    _delete_cache_by_prefix("promocion_cache")


# Limpiar chache de CURSOS PUBLICOS al momento de un cambio
@receiver([post_save, post_delete], sender=Curso)
def clear_curso_cache(sender, instance, **kwargs):
    print("Se ejecuto la limpieza para la vista CURSO")
    _delete_cache_by_prefix("curso_cache")
