from rest_framework.views import APIView
from rest_framework import viewsets, status, permissions, generics, filters
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.utils.decorators import method_decorator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .throttles import (
    PasswordResetRateThrottle,
    ProductoPublicoRateThrottle,
    PromocionPublicoRateThrottle,
    ContactoRateThrottle,
)
from .decorators import cache_page_server_only
from .utils import *
from .models import *
from .serializers import *
import logging

logger = logging.getLogger(__name__)

##############################################
# Creamos nuestras vistas para el login aqui
##############################################


# ======================
# VIEW REGISTRO
# ======================
class RegisterUserView(GenericAPIView):
    serializer_class = UserRegisterSerializer

    def post(self, request):
        user_data = request.data
        serializer = self.serializer_class(data=user_data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user = serializer.data
            # Enviamos correo con OTP al usuario
            send_code_to_user(user["email"])
            return Response(
                {
                    "data": user,
                    "message": f"Gracias por registrarse en L&F Grupo Farmacéutico, verifica tu cuenta con el codigo que te enviamos.",
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# VIEW VERIFICAR CORREO
# =========================
class VerifyUserEmailView(GenericAPIView):
    def post(self, request):
        otpcode = request.data.get("otp")

        # caso código vacío
        if not otpcode:
            return Response(
                {"message": "Debes ingresar un código de verificación"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_code_obj = OneTimePassword.objects.get(code=otpcode)
            user = user_code_obj.user

            # Verificar si el codigo ha expirado
            if user_code_obj.is_expired():
                return Response(
                    {"message": "El código de verificación ha expirado"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not user.is_verified:
                user.is_verified = True
                user.save()

                # Eliminar el codigo despues de usarlo
                user_code_obj.delete()

                return Response(
                    {"message": "Tu correo fue verificado con éxito"},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"message": "El correo ya está verificado"},
                    status=status.HTTP_200_OK,
                )

        except OneTimePassword.DoesNotExist:
            return Response(
                {"message": "El código de verificación no es válido"},
                status=status.HTTP_404_NOT_FOUND,
            )


# ==========================
# VIEW REENVIO DE CODIGO
# ==========================
class ResendOtpView(GenericAPIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)

            # Solo generar OTP si el correo aún no está verificado
            if user.is_verified:
                return Response({"message": "El correo ya está verificado"}, status=400)

            # Eliminar OTP anterior
            OneTimePassword.objects.filter(user=user).delete()

            # Generar nuevo OTP
            otp_code = generateOtp()
            OneTimePassword.objects.create(user=user, code=otp_code)

            # Enviar correo
            send_code_to_user(email)

            return Response(
                {"message": "Se ha enviado un nuevo código de verificación"}, status=200
            )

        except User.DoesNotExist:
            return Response({"message": "El correo no está registrado"}, status=404)


# ========================
# VIEW INICIO DE SESION
# ========================
class LoginUserView(GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ======================
# VIEW TEST DE SESION
# ======================
class TestAuthenticationView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {"message": "Es una sesion activa"}
        return Response(data, status=status.HTTP_200_OK)


# ===========================
# VIEW CAMBIO DE CONTRASEÑA
# ===========================
class PasswordResetView(GenericAPIView):
    """
    - Rate limiting: 3 solicitudes por hora por IP
    - Siempre responde éxito (seguridad)
    """

    serializer_class = PasswordResetRequestSerializer

    # Aplicar throttling
    throttle_classes = [PasswordResetRateThrottle]  # Usar custom
    throttle_scope = "password_reset"  # Nombre del scope definido en settings

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        return Response(
            {
                "message": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
            },
            status=status.HTTP_200_OK,
        )


# =====================================
# VIEW CONFIRMAR CAMBIO DE CONTRASEÑA
# =====================================
class PasswordResetConfirmView(GenericAPIView):
    def get(self, request, uidb64, token):
        try:
            user_id = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response(
                    {"message": "El token no es invalido o ha expirado."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response(
                {
                    "Exitoso": True,
                    "message": "Credenciales correctas y validas.",
                    "uidb64": uidb64,
                    "token": token,
                },
                status=status.HTTP_200_OK,
            )
        except DjangoUnicodeDecodeError:
            return Response(
                {"message": "El token no es invalido o ha expirado."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


# =====================================
# VIEW NUEVA CONTRASEÑA
# =====================================
class SetNewPasswordView(GenericAPIView):
    serializer_class = SetNewPasswordSerializer

    def patch(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Contraseña actualizada exitosamente."},
            status=status.HTTP_200_OK,
        )


# =====================================
# VIEW CERRAR SESION
# =====================================
class LogoutUserView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Obtener refresh token del body
            refresh_token = request.data.get("refresh_token")

            if not refresh_token:
                return Response(
                    {"error": "Refresh token es requerido"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Blacklist el refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Sesión cerrada exitosamente"}, status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": "Token inválido o ya expirado"},
                status=status.HTTP_400_BAD_REQUEST,
            )


##############################################
# Creamos nuestras vistas para las tablas aqui
##############################################


# ======================
# PERMISO - SOLO ADMIN (TODOS LOS MÉTODOS)
# ======================
class IsAdminOnly(permissions.BasePermission):
    """
    Permiso exclusivo para administradores.
    - Solo usuarios con is_admin=True pueden acceder
    - Aplica a TODOS los métodos (GET, POST, PUT, DELETE)
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(
            request.user, "is_admin", False
        )


# ======================
# PERMISO - ADMIN O SOLO LECTURA
# ======================
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso para vistas administrables.
    - Lectura (GET): Público
    - Escritura (POST, PUT, DELETE): Solo admins
    - Ejemplo: Portafolios, Productos, Cursos, Promociones
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True  # Cualquiera puede leer
        return request.user.is_authenticated and getattr(
            request.user, "is_admin", False
        )


# ======================
# USUARIO VIEWS
# ======================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOnly]

    def get_permissions(self):
        if self.action in ["create", "list"]:
            # Solo admin puede crear/listar usuarios
            return [IsAdminOnly()]
        return [IsAuthenticated()]

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
    )
    def me(self, request):
        """Obtener información del usuario autenticado"""
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)


class PortafolioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOnly]
    queryset = Portafolio.objects.all()
    serializer_class = PortafolioSerializer

    def perform_create(self, serializer):
        instancia = serializer.save()
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="PORTAFOLIO_CREADO",
            tipo_objeto="Portafolio",
            id_objeto=instancia.id,
            datos={"nombre": instancia.nombre},
        )

    def perform_update(self, serializer):
        instancia = serializer.save()
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="PORTAFOLIO_ACTUALIZADO",
            tipo_objeto="Portafolio",
            id_objeto=instancia.id,
            datos={"nombre": instancia.nombre},
        )

    def perform_destroy(self, instance):
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="PORTAFOLIO_ELIMINADO",
            tipo_objeto="Portafolio",
            id_objeto=instance.id,
            datos={"nombre": instance.nombre},
        )
        instance.delete()


# ==========================
# PORTAFOLIO PUBLICO VIEWS
# ==========================
# Cacheamos la vista publica por 24 HORAS
@method_decorator(
    cache_page_server_only(60 * 60 * 24, key_prefix="portafolio_cache"), name="dispatch"
)
class PortafolioPublicoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    queryset = Portafolio.objects.filter(activo=True)
    serializer_class = PortafolioPublicoSerializer


# ======================
# PRODUCTO VIEWS
# ======================
class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOnly]
    serializer_class = ProductoSerializer

    def get_queryset(self):
        """Filtrar productos según rol del usuario"""
        queryset = Producto.objects.all()

        # Si es admin, mostrar todos
        if self.request.user.is_admin:
            return queryset

        # Si está autenticado, filtrar por rol
        if self.request.user.is_authenticated:
            user_role = self.request.user.role

            # Usuarios profesionales ven todo
            if user_role == "profesional":
                return queryset

            # Usuarios generales solo ven productos para general
            return queryset.filter(tipo_usuario="general")

        # Si no autenticado, solo productos públicos
        return queryset.filter(tipo_usuario="general")

    def perform_create(self, serializer):
        instancia = serializer.save()
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="PRODUCTO_CREADO",
            tipo_objeto="Producto",
            id_objeto=instancia.id,
            datos={
                "nombre": instancia.nombre,
                "portafolio": instancia.portafolio.nombre,
            },
        )

    def perform_update(self, serializer):
        instancia = serializer.save()
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="PRODUCTO_ACTUALIZADO",
            tipo_objeto="Producto",
            id_objeto=instancia.id,
            datos={"nombre": instancia.nombre},
        )

    def perform_destroy(self, instancia):
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="PRODUCTO_ELIMINADO",
            tipo_objeto="Producto",
            id_objeto=instancia.id,
            datos={"nombre": instancia.nombre},
        )
        instancia.delete()


# =========================
# PRODUCTO CON ROL VIEWS
# =========================
# Cacheamos la vista pública por 24 HORAS
@method_decorator(
    cache_page_server_only(60 * 60 * 24, key_prefix="producto_cache"), name="dispatch"
)
class ProductoConRolViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    serializer_class = ProductoConRolSerializer

    def get_queryset(self):
        """Filtrar productos según rol del usuario"""
        queryset = Producto.objects.filter(portafolio__activo=True, activo=True)

        # Si está autenticado, filtrar por rol
        if self.request.user.is_authenticated:
            user_role = self.request.user.role

            # Usuarios profesionales ven todo
            if user_role == "profesional":
                return queryset

            # Usuarios generales solo ven productos para general
            return queryset.filter(tipo_usuario="general")

        # Si no autenticado, solo productos públicos
        # return queryset.filter(tipo_usuario="general")
        return None

    def get_serializer_context(self):
        """Pasar request al serializer"""
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


# ===================================
# PRODUCTO PUBLICO DESTACADO VIEWS
# ===================================
# Cacheamos la vista publica por 24 HORAS
@method_decorator(
    cache_page_server_only(60 * 60 * 24, key_prefix="producto_cache"), name="dispatch"
)
class ProductoPublicoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]

    # Aplicar throttling
    throttle_classes = [ProductoPublicoRateThrottle] 
    throttle_scope = "producto_publico" 

    queryset = Producto.objects.filter(
        activo=True, destacado=True, tipo_usuario="general", portafolio__activo=True
    )
    serializer_class = ProductoPublicoSerializer


# ======================
# PROMOCION VIEWS
# ======================
class PromocionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOnly]
    queryset = Promocion.objects.all()
    serializer_class = PromocionSerializer

    def perform_create(self, serializer):
        instancia = serializer.save()
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="PROMOCION_CREADA",
            tipo_objeto="Promocion",
            id_objeto=instancia.id,
            datos={"nombre": instancia.nombre},
        )

    def perform_update(self, serializer):
        instancia = serializer.save()
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="PROMOCION_ACTUALIZADA",
            tipo_objeto="Promocion",
            datos={"nombre": instancia.nombre},
        )

    def perform_destroy(self, instancia):
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="PROMOCION_ELIMINADA",
            id_objeto=instancia.id,
            datos={"nombre": instancia.nombre},
        )
        instancia.delete()


# ========================
# PROMOCION PUBLICO VIEWS
# =========================
# Cacheamos la vista publica por 24 HORAS
@method_decorator(
    cache_page_server_only(60 * 60 * 24, key_prefix="promocion_cache"), name="dispatch"
)
class PromocionPublicoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]

    # Aplicar throttling
    throttle_classes = [PromocionPublicoRateThrottle] 
    throttle_scope = "promocion_publico" 

    queryset = Promocion.objects.filter(activo=True)
    serializer_class = PromocionPublicoSerializer


# ======================
# CURSO VIEWS
# ======================
class CursoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOnly]
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer

    def perform_create(self, serializer):
        instancia = serializer.save()
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="CURSO_CREADO",
            tipo_objeto="Curso",
            id_objeto=instancia.id,
            datos={"titulo": instancia.titulo},
        )

    def perform_update(self, serializer):
        instancia = serializer.save()
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="CURSO_ACTUALIZADO",
            tipo_objeto="Curso",
            id_objeto=instancia.id,
            datos={"titulo": instancia.titulo},
        )

    def perform_destroy(self, instancia):
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="CURSO_ELIMINADO",
            tipo_objeto="Curso",
            id_objeto=instancia.id,
            datos={"titulo": instancia.titulo},
        )
        instancia.delete()


# ======================
# CURSO PUBLICO VIEWS
# ======================
# Cacheamos la vista publica por 24 HORAS
@method_decorator(cache_page_server_only(60 * 60 * 24, key_prefix="curso_cache"), name="dispatch")
class CursoPublicoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    queryset = Curso.objects.filter(activo=True)
    serializer_class = CursoPublicoSerializer


# ======================
# HISTORIAL COMPRA VIEWS
# ======================
class HistorialCompraViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOnly]
    queryset = HistorialCompra.objects.all()
    serializer_class = HistorialCompraSerializer

    def perform_create(self, serializer):
        instancia = serializer.save()
        AuditoriaCambio.objects.create(
            user=self.request.user,
            accion="COMPRA_CREADA",
            tipo_objeto="HistorialCompra",
            id_objeto=instancia.id,
            datos={
                "total": instancia.total,
                "cantidad_productos": (
                    len(instancia.productos) if instancia.productos else 0
                ),
            },
        )


# ======================
# AUDITORIA CAMBIO VIEWS
# ======================
class AuditoriaCambioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOnly]
    queryset = AuditoriaCambio.objects.all().select_related("user")
    serializer_class = AuditoriaCambioSerializer

    def get_queryset(self):
        queryset = AuditoriaCambio.objects.all()

        # Filtrar por rango de fechas
        inicia = self.request.query_params.get("inicia")
        finaliza = self.request.query_params.get("finaliza")

        if inicia:
            queryset = queryset.filter(creado__gte=inicia)
        if finaliza:
            queryset = queryset.filter(creado__lte=finaliza)

        return queryset


# ======================
# CONTACTO VIEWS
# ======================
class ContactoViewSet(APIView):
    permission_classes = [AllowAny]

    # Aplicar throttling
    throttle_classes = [ContactoRateThrottle]  # Usar custom
    throttle_scope = "contacto_publico"  # Nombre del scope definido en settings

    def post(self, request, *args, **kwargs):
        serializer = ContactoFormularioSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Datos inválidos", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Envío sincrónico (seguro para bajo tráfico)
        send_contact_email(serializer.validated_data)

        return Response(
            {"message": "Solicitud recibida correctamente. Te contactaremos pronto."},
            status=status.HTTP_201_CREATED,
        )
