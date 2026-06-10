from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.utils.formats import date_format
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from .managers import UserManager
import datetime
import os
import uuid

####
# Creamos nuestros modelos para el login aqui
####

# ======================
# CHOICES Y CONSTANTES
# ======================
ROLE_CHOICES = [
    ("general", "General"),
    ("profesional", "Profesional"),
]


# ======================
# MODELO USUARIO
# ======================
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True, verbose_name=_("Correo"))
    first_name = models.CharField(max_length=100, verbose_name=_("Nombre"))
    last_name = models.CharField(max_length=100, verbose_name=_("Apellido"))
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name=_("Registro"))
    role = models.CharField(
        max_length=30, choices=ROLE_CHOICES, default="general", verbose_name=_("Role")
    )
    is_staff = models.BooleanField(default=False, verbose_name=_("Acceso al panel"))
    is_superuser = models.BooleanField(default=False, verbose_name=_("Super usuario"))
    is_admin = models.BooleanField(default=False, verbose_name=_("Administrador"))
    is_verified = models.BooleanField(default=False, verbose_name=_("Verificado"))
    is_active = models.BooleanField(default=True, verbose_name=_("Activo"))

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


# ====================================================
# FUNCION PARA CALCULAR LA EXPIRACION DEL CODIGO OTP
# ====================================================
def default_expiration():
    return timezone.now() + timedelta(minutes=10)


# ================================
# MODELO PARA VALIDAR CODIGO OTP
# ================================
class OneTimePassword(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    code = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expiration)

    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        """Verifica si el código aún es válido (no expirado)"""
        return not self.is_expired()


####
# Creamos nuestros modelos para las tablas aqui
####


# =================================
# FUNCIONES UPLOAD_TO (Portafolio)
# =================================
def portafolio_logo_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"portafolios/logos/{uuid.uuid4().hex}{ext}"


def portafolio_banner_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"portafolios/banners/{uuid.uuid4().hex}{ext}"


def portafolio_catalogo_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"portafolios/catalogos/{uuid.uuid4().hex}{ext}"


# ======================
# MODELO PORTAFOLIO
# ======================
class Portafolio(models.Model):
    nombre = models.CharField(max_length=30, unique=True, verbose_name=_("Nombre"))
    logo = models.ImageField(
        upload_to=portafolio_logo_upload_to,
        verbose_name=_("Logo"),
    )
    resumen = models.TextField(max_length=80, verbose_name=_("Resumen"))
    ruta = models.SlugField(max_length=30, unique=True, verbose_name=_("Ruta"))
    titulo = models.CharField(max_length=50, verbose_name=_("Titulo"))
    banner = models.ImageField(
        upload_to=portafolio_banner_upload_to,
        verbose_name=_("Banner"),
    )
    descripcion = models.TextField(max_length=700, verbose_name=_("Descripcion"))
    catalogo_pdf = models.FileField(
        upload_to=portafolio_catalogo_upload_to,
        blank=True,
        null=True,
        verbose_name=_("Catalogo PDF"),
    )
    activo = models.BooleanField(default=True, verbose_name=_("Activo"))
    creado = models.DateTimeField(auto_now_add=True, verbose_name=_("Creado"))
    actualizado = models.DateTimeField(auto_now=True, verbose_name=_("Actualizado"))

    class Meta:
        managed = True
        db_table = "portafolios"
        verbose_name = _("Portafolio")
        verbose_name_plural = _("Portafolios")
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


# =================================
# FUNCIONES UPLOAD_TO (Producto)
# =================================
def producto_img_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"productos/{uuid.uuid4().hex}{ext}"


# ======================
# MODELO PRODUCTO
# ======================
class Producto(models.Model):
    portafolio = models.ForeignKey(
        Portafolio,
        related_name="productos",
        on_delete=models.CASCADE,
        verbose_name=_("Portafolio"),
    )
    img = models.ImageField(
        upload_to=producto_img_upload_to,
        verbose_name=_(
            "Imagen",
        ),
    )
    nombre = models.CharField(max_length=60, verbose_name=_("Nombre"))
    descripcion = models.TextField(max_length=300, verbose_name=_("Descripcion"))
    precio = models.BigIntegerField(verbose_name=_("Precio (COP)"))
    descuento = models.IntegerField(
        null=True, blank=True, verbose_name=_("% Descuento")
    )
    precio_descuento = models.BigIntegerField(
        null=True, blank=True, verbose_name=_("Precio con descuento (COP)")
    )
    tipo_usuario = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES,
        default="general",
        verbose_name=_("Tipo de usuario"),
    )
    destacado = models.BooleanField(default=False, verbose_name=_("Destacado"))
    activo = models.BooleanField(default=True, verbose_name=_("Activo"))
    creado = models.DateTimeField(auto_now_add=True, verbose_name=_("Creado"))
    actualizado = models.DateTimeField(auto_now=True, verbose_name=_("Actualizado"))

    class Meta:
        managed = True
        db_table = "productos"
        verbose_name = _("Producto")
        verbose_name_plural = _("Productos")
        ordering = ["nombre"]

    def __str__(self):
        return f"{self.nombre} ({self.portafolio.nombre})"

    def save(self, *args, **kwargs):
        """Calcular precio con descuento automáticamente si aplica"""
        if self.precio is not None and self.descuento is not None:
            if 0 <= self.descuento <= 100:
                self.precio_descuento = int(self.precio * (1 - self.descuento / 100))
            else:
                # Si el descuento no es válido, lo ignoramos
                self.precio_descuento = self.precio
        else:  # Si no hay descuento, el precio con descuento es igual al precio normal
            self.precio_descuento = None
        super().save(*args, **kwargs)


# =================================
# FUNCIONES UPLOAD_TO (Curso)
# =================================
def curso_img_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"cursos/{uuid.uuid4().hex}{ext}"


# ======================
# MODELO CURSO
# ======================
class Curso(models.Model):
    img = models.ImageField(
        upload_to=curso_img_upload_to,
        verbose_name=_(
            "Imagen",
        ),
    )
    titulo = models.CharField(max_length=50, verbose_name=_("Titulo"))
    descripcion = models.TextField(
        max_length=100, blank=True, verbose_name=_("Descripcion")
    )
    profesional = models.CharField(max_length=50, verbose_name=_("Profesional"))
    link = models.URLField(max_length=600, null=True, verbose_name=_("Video URL"))
    activo = models.BooleanField(default=True, verbose_name=_("Activo"))
    creado = models.DateTimeField(auto_now_add=True, verbose_name=_("Creado"))
    actualizado = models.DateTimeField(auto_now=True, verbose_name=_("Actualizado"))

    class Meta:
        managed = True
        db_table = "cursos"
        verbose_name = _("Curso")
        verbose_name_plural = _("Cursos")
        ordering = ["-creado"]

    def __str__(self):
        return self.titulo


# =================================
# FUNCIONES UPLOAD_TO (Promocion)
# =================================
def promocion_img_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"promociones/{uuid.uuid4().hex}{ext}"


# ======================
# MODELO PROMOCION
# ======================
class Promocion(models.Model):
    nombre = models.CharField(max_length=50, verbose_name=_("Nombre Promocion"))
    banner = models.ImageField(
        upload_to=promocion_img_upload_to,
        verbose_name=_("Banner"),
    )
    titulo = models.CharField(max_length=50, verbose_name=_("Titulo"))
    subtitulo = models.CharField(max_length=50, verbose_name=_("Subtitulo"))
    descripcion = models.TextField(max_length=100, verbose_name=_("Descripción"))
    texto_boton = models.CharField(max_length=30, verbose_name=_("Texto del Botón"))
    link = models.CharField(max_length=600, verbose_name=_("Link"))
    activo = models.BooleanField(default=True, verbose_name=_("Activa"))
    creado = models.DateTimeField(auto_now_add=True, verbose_name=_("Creado"))
    actualizado = models.DateTimeField(auto_now=True, verbose_name=_("Actualizado"))

    class Meta:
        managed = True
        db_table = "promociones"
        verbose_name = _("Promocion")
        verbose_name_plural = _("Promociones")
        ordering = ["creado"]

    def __str__(self):
        return self.nombre


# ======================
# MODELO HISTORIAL COMPRA
# ======================
class HistorialCompra(models.Model):
    """
    {
        "product_id": int,
        "name": str,
        "qty": int,
        "unit_price": int,
        "subtotal": int
    },
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="historial_compras",
        verbose_name=_("User"),
    )
    productos = models.JSONField(verbose_name=_("Productos"))
    total = models.BigIntegerField(verbose_name=_("Total (COP)"))
    numero_whatsapp = models.CharField(
        max_length=30, blank=True, verbose_name=_("Numero de WhatsApp")
    )
    mensaje_whatsapp = models.TextField(
        blank=True, verbose_name=_("Mensaje de WhatsApp")
    )
    metadatos_cliente = models.JSONField(
        null=True, blank=True, verbose_name=_("Metadatos del cliente")
    )
    estado = models.CharField(
        max_length=50,
        default="pendiente",
        choices=[
            ("pendiente", "Pendiente"),
            ("procesado", "Procesado"),
            ("cancelado", "Cancelado"),
        ],
        verbose_name=_("Estado"),
    )
    creado = models.DateTimeField(auto_now_add=True, verbose_name=_("Creado"))
    actualizado = models.DateTimeField(auto_now=True, verbose_name=_("Actualizado"))

    class Meta:
        managed = True
        db_table = "historial_compras"
        verbose_name = _("Historial Compra")
        verbose_name_plural = _("Historial Compras")
        ordering = ["-creado"]

    def __str__(self):
        correo_usuario = self.user.email if self.user else "Guest"
        return f"Compra {self.id} - {correo_usuario} - ${self.total:,}"


# ======================
# MODELO AUDITORIA DE CAMBIOS
# ======================
class AuditoriaCambio(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="auditoria_cambios",
        verbose_name=_("Usuario"),
    )
    accion = models.CharField(max_length=100, verbose_name=_("Accion"))
    tipo_objeto = models.CharField(
        max_length=100, blank=True, verbose_name=_("Tipo objeto")
    )
    id_objeto = models.IntegerField(null=True, blank=True, verbose_name=_("ID objeto"))
    datos = models.JSONField(null=True, blank=True, verbose_name=_("Datos"))
    direccion_ip = models.GenericIPAddressField(
        null=True, blank=True, verbose_name=_("Dirección IP")
    )
    creado = models.DateTimeField(auto_now_add=True, verbose_name=_("Creado"))

    class Meta:
        managed = True
        db_table = "auditoria_cambios"
        verbose_name = _("Auditoria Cambio")
        verbose_name_plural = _("Auditoria Cambios")
        ordering = ["-creado"]

    def __str__(self):
        fecha_formateada = date_format(
            self.creado, format=r"l, d \d\\e F \d\\e Y", use_l10n=True
        )
        correo_usuario = self.user.email if self.user else "System"
        return f"Fecha: {fecha_formateada} Usuario: {correo_usuario} Acción: - {self.accion}"
