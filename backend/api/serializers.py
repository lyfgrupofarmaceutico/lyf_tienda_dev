from django.conf import settings
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.sites.shortcuts import get_current_site
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import smart_bytes, force_str
from django.urls import reverse
import logging
import re
from .models import *
from .utils import send_password_reset_email

####
# Creamos nuestros serializadores para el login aqui
####


# ==============================
# SERIALIZER INICIO DE SESION
# ==============================
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255, min_length=6)
    password = serializers.CharField(max_length=68, write_only=True)
    full_name = serializers.CharField(max_length=255, read_only=True)
    role = serializers.CharField(max_length=30, read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    access_token = serializers.CharField(max_length=255, read_only=True)
    refresh_token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        request = self.context.get("request")

        # 1. Usuario no existe
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Correo no registrado")

        # 2 y 3. Usuario existe pero contraseña incorrecta
        user = authenticate(request, email=email, password=password)
        if not user:
            raise AuthenticationFailed("Contraseña incorrecta")

        # 2. Usuario existe pero no verificado
        if not user.is_verified:
            raise AuthenticationFailed("Correo no verificado")

        # Adicional: Actualizamos "last_login" manualmente
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        # 4. Todo OK → construir respuesta
        user_tokens = user.tokens()
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.get_full_name,
            "role": user.role,
            "is_admin": user.is_admin,
            "is_superuser": user.is_superuser,
            "access_token": user_tokens["access"],
            "refresh_token": user_tokens["refresh"],
        }


# ======================
# SERIALIZER REGISTRO
# ======================
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=24, min_length=8, write_only=True)
    password2 = serializers.CharField(max_length=24, min_length=8, write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
        ]

    def validate_password(self, value):
        errors = []

        if len(value) < 8:
            errors.append("tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", value):
            errors.append("incluir al menos una letra mayúscula")
        if not re.search(r"\d", value):
            errors.append("incluir al menos un número")
        if errors:
            raise serializers.ValidationError(
                f"La contraseña debe {', '.join(errors)}."
            )
        return value

    def validate(self, attrs):
        password = attrs.get("password", "")
        password2 = attrs.get("password2", "")
        if password != password2:
            raise serializers.ValidationError("Las contraseñas no coinciden")

        # Normalizamos los datos
        attrs["email"] = attrs["email"].lower().strip()
        attrs["first_name"] = attrs["first_name"].lower().strip()
        attrs["last_name"] = attrs["last_name"].lower().strip()

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
            password=validated_data.get("password"),
        )

        return user


# ===========================================
# SERIALIZER CAMBIAR CONTRASEÑA
# ===========================================
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255, write_only=True)

    def validate_email(self, value):
        """Validación básica de formato (sin revelar existencia)"""
        if not value.strip():
            raise serializers.ValidationError("El correo electrónico es requerido")
        return value.lower().strip()

    def validate(self, attrs):
        email = attrs.get("email")
        frontend_domain = attrs.get("frontend_domain", settings.FRONTEND_URL)

        # Buscar usuario ACTIVO (sin revelar existencia en errores)
        try:
            # Solo usuarios activos pueden recuperar contraseña
            user = User.objects.get(email=email, is_active=True)

            # Generar token y UID
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)

            # CONSTRUIR LINK PARA FRONTEND
            request = self.context.get("request")
            site_domain = get_current_site(request).domain
            abslink = f"{frontend_domain}/auth/password-reset-confirm/{uidb64}/{token}/"

            # Enviar email con el link
            send_password_reset_email(user, abslink)

        except User.DoesNotExist:
            # NO revelar si el email existe o no (seguridad)
            # Simplemente no enviamos email y continuamos
            pass
        except Exception as e:
            # Loguear error interno sin revelar detalles al cliente
            logger = logging.getLogger(__name__)
            logger.error(f"Error al procesar recuperación para {email}: {str(e)}")

        # Siempre retornar attrs (nunca lanzar ValidationError aquí)
        return attrs


# ========================================
# SERIALIZER CONFIRMAR NUEVO PASSWORD
# ========================================
class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    uidb64 = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)

    def validate_password(self, value):
        errors = []

        # 1. Mínimo 8 caracteres
        if len(value) < 8:
            errors.append("tener al menos 8 caracteres")

        # 2. Al menos una letra mayúscula
        if not re.search(r"[A-Z]", value):
            errors.append("incluir al menos una letra mayúscula")

        # 3. Al menos un número
        if not re.search(r"\d", value):
            errors.append("incluir al menos un número")

        if errors:
            raise serializers.ValidationError(
                f"La contraseña debe {', '.join(errors)}."
            )

        return value

    def validate(self, attrs):
        token = attrs.get("token")
        uidb64 = attrs.get("uidb64")
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise AuthenticationFailed("El link no es válido o ha expirado")

        if not PasswordResetTokenGenerator().check_token(user, token):
            raise AuthenticationFailed("El link no es válido o ha expirado")

        if password != confirm_password:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden"}
            )

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["password"])
        user.save()
        return user


# ======================
# SERIALIZER CERRAR SESION
# ======================
class LogoutUserSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()

    default_error_messages = {"bad_token": "El token no es valido o ha expirado"}

    def validate(self, attrs):
        self.token = attrs.get("refresh_token")
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except TokenError:
            return self.fail("bad_token")


####
# Creamos nuestros serializadores para las tablas aqui
####


# ======================
# USER SERIALIZERS
# ======================
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=68, min_length=6, write_only=True)
    password2 = serializers.CharField(max_length=68, min_length=6, write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
            "role",
            "is_admin",
            "is_verified",
            "is_active",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]

    def validate(self, attrs):
        password = attrs.get("password", "")
        password2 = attrs.get("password2", "")
        if password != password2:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
            password=validated_data.get("password"),
        )

        return user


# ======================
# PORTAFOLIO SERIALIZERS
# ======================
class PortafolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portafolio
        fields = [
            "id",
            "nombre",
            "logo",
            "resumen",
            "ruta",
            "titulo",
            "banner",
            "descripcion",
            "catalogo_pdf",
            "activo",
        ]


# =================================
# PORTAFOLIO PUBLICO SERIALIZERS
# =================================
class PortafolioPublicoSerializer(serializers.ModelSerializer):
    productos = serializers.SerializerMethodField()

    class Meta:
        model = Portafolio
        fields = [
            "id",
            "nombre",
            "logo",
            "resumen",
            "ruta",
            "titulo",
            "banner",
            "descripcion",
            "catalogo_pdf",
            "activo",
            "productos",
        ]

    def get_productos(self, obj):
        # Solo productos activos y cuyo portafolio esté activo
        productos = Producto.objects.filter(
            portafolio=obj, activo=True, portafolio__activo=True
        )
        return ProductoConRolSerializer(
            productos,
            many=True,
            context=self.context,
        ).data


# ======================
# PRODUCTO SERIALIZER
# ======================
class ProductoSerializer(serializers.ModelSerializer):
    portafolio_nombre = serializers.CharField(
        source="portafolio.nombre", read_only=True
    )
    portafolio_ruta = serializers.CharField(source="portafolio.ruta", read_only=True)

    class Meta:
        model = Producto
        fields = [
            "id",
            "portafolio",
            "portafolio_nombre",
            "portafolio_ruta",
            "img",
            "nombre",
            "descripcion",
            "precio",
            "descuento",
            "precio_descuento",
            "tipo_usuario",
            "destacado",
            "activo",
        ]

    def validate_descuento(self, value):
        """Validar que el descuento esté entre 0 y 100"""
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("El descuento debe estar entre 0 y 100")
        return value


# =======================================
# PRODUCTO CON ROL SERIALIZER
# =======================================
class ProductoConRolSerializer(serializers.ModelSerializer):

    class Meta:
        model = Producto
        fields = [
            "id",
            "img",
            "nombre",
            "precio",
            "descuento",
            "precio_descuento",
            "destacado",
            "descripcion",
            "tipo_usuario",
        ]

    def to_representation(self, instance):
        """Ocultar productos según rol del usuario"""
        representation = super().to_representation(instance)

        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            user_role = request.user.role

            # Si el producto es solo para profesionales y el usuario es general → ocultar
            if instance.tipo_usuario == "profesional" and user_role == "general":
                return None

        return representation


# =======================================
# PRODUCTO PUBLICO DESTACADO SERIALIZER
# =======================================
class ProductoPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ["img", "nombre", "descripcion"]


# ======================
# PROMOCION SERIALIZERS
# ======================
class PromocionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocion
        fields = [
            "id",
            "nombre",
            "banner",
            "titulo",
            "subtitulo",
            "descripcion",
            "texto_boton",
            "link",
            "activo",
            "creado",
            "actualizado",
        ]


# ================================
# PROMOCION PUBLICO SERIALIZER
# ================================
class PromocionPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocion
        fields = [
            "id",
            "nombre",
            "banner",
            "titulo",
            "subtitulo",
            "descripcion",
            "texto_boton",
            "link",
            "activo",
        ]


# ======================
# CURSO SERIALIZERS
# ======================
class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = [
            "id",
            "img",
            "titulo",
            "descripcion",
            "profesional",
            "link",
            "activo",
            "creado",
            "actualizado",
        ]


# ======================
# CURSO PUBLICO SERIALIZERS
# ======================
class CursoPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = [
            "id",
            "img",
            "titulo",
            "descripcion",
            "profesional",
            "link",
            "activo",
        ]


# ======================
# HISTORIAL COMPRA SERIALIZER
# ======================
class HistorialCompraSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(source="user", read_only=True)
    total_formateado = serializers.SerializerMethodField()

    class Meta:
        model = HistorialCompra
        fields = [
            "id",
            "usuario",
            "productos",
            "total",
            "total_formateado",
            "numero_whatsapp",
            "mensaje_whatsapp",
            "estado",
            "creado",
        ]

    def get_total_formateado(self, obj):
        """Formatea el total en formato legible"""
        return f"${obj.total:}"

    def create(self, validated_data):
        """Crea un historial de compra con el usuario autenticado"""
        request = self.context.get("request")
        if request and hasattr(request, "usuario"):
            validated_data["usuario"] = request.usuario
        return super().create(validated_data)


# ======================
# AUDITORIA DE CAMBIO SERIALIZER
# ======================
class AuditoriaCambioSerializer(serializers.ModelSerializer):
    correo_usuario = serializers.CharField(
        source="user.email", read_only=True, allow_null=True
    )

    class Meta:
        model = AuditoriaCambio
        fields = [
            "id",
            "correo_usuario",
            "accion",
            "tipo_objeto",
            "id_objeto",
            "datos",
            "direccion_ip",
            "creado",
        ]


# ======================
# CONTACTO SERIALIZER
# ======================
class ContactoFormularioSerializer(serializers.Serializer):
    fullname = serializers.CharField(max_length=150, trim_whitespace=True)
    phone = serializers.CharField(max_length=20, trim_whitespace=True)
    city = serializers.CharField(max_length=100, trim_whitespace=True)
    email = serializers.EmailField(max_length=250)
    reason = serializers.CharField(max_length=200, trim_whitespace=True)
    message = serializers.CharField(max_length=2000, trim_whitespace=True)

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "El mensaje debe tener al menos 10 caracteres."
            )
        return value
