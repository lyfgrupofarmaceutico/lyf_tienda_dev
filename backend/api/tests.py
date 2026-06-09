"""
Tests para la API de L&F Grupo Farmacéutico

Ejecutar tests:
    python manage.py test api

Ejecutar tests con output detallado:
    python manage.py test api --verbosity=2

Ejecutar un test específico:
    python manage.py test api.tests.AuthenticationTests.test_login_exitoso
"""

import json

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import OneTimePassword, Portafolio, Producto, Promocion, Curso

User = get_user_model()


# ==========================================
# UTILIDADES PARA TESTS
# ==========================================
def create_user(email="test@example.com", password="Test123!", **kwargs):
    """Crear usuario de prueba"""
    return User.objects.create_user(
        email=email,
        first_name=kwargs.get("first_name", "Test"),
        last_name=kwargs.get("last_name", "User"),
        password=password,
        **kwargs,
    )


def create_admin_user(email="admin@example.com", password="Admin123!"):
    """Crear usuario administrador de prueba"""
    return User.objects.create_superuser(
        email=email,
        first_name="Admin",
        last_name="User",
        password=password,
    )


def get_tokens_for_user(user):
    """Obtener tokens JWT para un usuario"""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


# ==========================================
# TESTS DE AUTENTICACIÓN
# ==========================================
class AuthenticationTests(APITestCase):
    """Tests para endpoints de autenticación"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.verify_email_url = reverse("verify-email")
        self.user_data = {
            "email": "nuevo@example.com",
            "first_name": "Nuevo",
            "last_name": "Usuario",
            "password": "Nuevo123!",
            "password2": "Nuevo123!",
        }

    def test_registro_usuario_exitoso(self):
        """Test: Registro de usuario con datos válidos"""
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("data", response.data)
        self.assertEqual(response.data["data"]["email"], self.user_data["email"])
        # Verificar que el usuario fue creado en DB
        self.assertTrue(User.objects.filter(email=self.user_data["email"]).exists())

    def test_registro_contrasena_corta(self):
        """Test: Registro con contraseña menor a 8 caracteres"""
        self.user_data["password"] = "short"
        self.user_data["password2"] = "short"
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_registro_contrasena_sin_mayuscula(self):
        """Test: Registro con contraseña sin mayúscula"""
        self.user_data["password"] = "minuscula123"
        self.user_data["password2"] = "minuscula123"
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registro_contrasena_sin_numero(self):
        """Test: Registro con contraseña sin número"""
        self.user_data["password"] = "Mayuscula"
        self.user_data["password2"] = "Mayuscula"
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registro_passwords_no_coinciden(self):
        """Test: Registro con contraseñas diferentes"""
        self.user_data["password2"] = "Diferente123!"
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_registro_email_invalido(self):
        """Test: Registro con email inválido"""
        self.user_data["email"] = "email-invalido"
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_exitoso(self):
        """Test: Login con credenciales válidas"""
        # Primero crear y verificar usuario
        user = create_user(is_verified=True)
        login_data = {
            "email": user.email,
            "password": "Test123!",
        }
        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.data)
        self.assertIn("refresh_token", response.data)
        self.assertEqual(response.data["email"], user.email)

    def test_login_credenciales_incorrectas(self):
        """Test: Login con contraseña incorrecta"""
        user = create_user(is_verified=True)
        login_data = {
            "email": user.email,
            "password": "WrongPassword123!",
        }
        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_usuario_no_verificado(self):
        """Test: Login con usuario no verificado"""
        user = create_user(is_verified=False)
        login_data = {
            "email": user.email,
            "password": "Test123!",
        }
        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("verificado", str(response.data))

    def test_login_usuario_no_existe(self):
        """Test: Login con email no registrado"""
        login_data = {
            "email": "noexiste@example.com",
            "password": "Test123!",
        }
        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ==========================================
# TESTS DE MODELOS
# ==========================================
class ModelTests(TestCase):
    """Tests para modelos de datos"""

    def test_creacion_usuario(self):
        """Test: Crear usuario básico"""
        user = create_user()
        self.assertEqual(str(user), user.email)
        self.assertFalse(user.is_admin)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_active)

    def test_creacion_admin_usuario(self):
        """Test: Crear usuario administrador"""
        admin = create_admin_user()
        self.assertTrue(admin.is_admin)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)

    def test_usuario_get_full_name(self):
        """Test: Propiedad get_full_name del usuario"""
        user = create_user(first_name="Juan", last_name="Pérez")
        self.assertEqual(user.get_full_name, "Juan Pérez")

    def test_portafolio_creacion(self):
        """Test: Crear portafolio"""
        portafolio = Portafolio.objects.create(
            nombre="Test Portafolio",
            ruta="test-portafolio",
            resumen="Resumen de prueba",
        )
        self.assertEqual(str(portafolio), portafolio.nombre)
        self.assertTrue(portafolio.activo)

    def test_portafolio_nombre_unique(self):
        """Test: Portafolio nombre debe ser único"""
        Portafolio.objects.create(nombre="Duplicado", ruta="test-1")
        with self.assertRaises(Exception):
            Portafolio.objects.create(nombre="Duplicado", ruta="test-2")

    def test_producto_creacion(self):
        """Test: Crear producto"""
        portafolio = Portafolio.objects.create(
            nombre="Test Portafolio", ruta="test-portafolio"
        )
        producto = Producto.objects.create(
            portafolio=portafolio,
            nombre="Producto Test",
            precio=100000,
            descripcion="Descripción de prueba",
        )
        self.assertEqual(str(producto), f"{producto.nombre} ({portafolio.nombre})")
        self.assertTrue(producto.activo)

    def test_producto_descuento_automatico(self):
        """Test: Cálculo automático de precio con descuento"""
        portafolio = Portafolio.objects.create(
            nombre="Test Portafolio", ruta="test-portafolio"
        )
        producto = Producto.objects.create(
            portafolio=portafolio,
            nombre="Producto con Descuento",
            precio=100000,
            descuento=20,
        )
        self.assertEqual(producto.precio_descuento, 80000)

    def test_producto_descuento_invalido(self):
        """Test: Descuento mayor a 100 no es válido"""
        portafolio = Portafolio.objects.create(
            nombre="Test Portafolio", ruta="test-portafolio"
        )
        producto = Producto.objects.create(
            portafolio=portafolio,
            nombre="Producto",
            precio=100000,
            descuento=150,  # Inválido
        )
        # El descuento inválido debe resultar en precio_descuento = precio
        self.assertEqual(producto.precio_descuento, 100000)

    def test_promocion_creacion(self):
        """Test: Crear promoción"""
        promocion = Promocion.objects.create(
            nombre="Promo Test",
            titulo="Título de prueba",
        )
        self.assertEqual(str(promocion), promocion.nombre)
        self.assertTrue(promocion.activo)

    def test_curso_creacion(self):
        """Test: Crear curso"""
        curso = Curso.objects.create(
            titulo="Curso Test",
            descripcion="Descripción del curso",
        )
        self.assertEqual(str(curso), curso.titulo)


# ==========================================
# TESTS DE ENDPOINTS PROTEGIDOS
# ==========================================
class ProtectedEndpointsTests(APITestCase):
    """Tests para endpoints que requieren autenticación"""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user(is_verified=True)
        self.tokens = get_tokens_for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}")

    def test_profile_autenticado(self):
        """Test: Obtener perfil con usuario autenticado"""
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_profile_no_autenticado(self):
        """Test: Obtener perfil sin autenticación"""
        self.client.credentials()
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ==========================================
# TESTS DE ADMIN ENDPOINTS
# ==========================================
class AdminEndpointsTests(APITestCase):
    """Tests para endpoints exclusivos de administradores"""

    def setUp(self):
        self.client = APIClient()
        self.admin = create_admin_user()
        self.user_normal = create_user(email="normal@example.com", is_verified=True)
        self.admin_tokens = get_tokens_for_user(self.admin)
        self.user_tokens = get_tokens_for_user(self.user_normal)

        # URLs
        self.usuarios_url = reverse("usuarios-list")
        self.portafolios_url = reverse("portafolios-list")
        self.productos_url = reverse("productos-list")

    def test_admin_listar_usuarios(self):
        """Test: Admin puede listar usuarios"""
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.admin_tokens['access']}"
        )
        response = self.client.get(self.usuarios_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_usuario_normal_no_puede_listar_usuarios(self):
        """Test: Usuario normal no puede listar usuarios"""
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.user_tokens['access']}"
        )
        response = self.client.get(self.usuarios_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_crear_portafolio(self):
        """Test: Admin puede crear portafolio"""
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.admin_tokens['access']}"
        )
        data = {
            "nombre": "Portafolio Test",
            "ruta": "portafolio-test",
            "resumen": "Resumen de prueba",
        }
        response = self.client.post(self.portafolios_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Portafolio.objects.filter(nombre="Portafolio Test").exists())

    def test_usuario_normal_no_puede_crear_portafolio(self):
        """Test: Usuario normal no puede crear portafolio"""
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.user_tokens['access']}"
        )
        data = {
            "nombre": "Portafolio Test",
            "ruta": "portafolio-test",
        }
        response = self.client.post(self.portafolios_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_crear_producto(self):
        """Test: Admin puede crear producto"""
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.admin_tokens['access']}"
        )
        # Primero crear portafolio
        portafolio = Portafolio.objects.create(
            nombre="Portafolio Test", ruta="portafolio-test"
        )
        data = {
            "nombre": "Producto Test",
            "precio": 100000,
            "portafolio": portafolio.id,
            "descripcion": "Descripción de prueba",
        }
        response = self.client.post(self.productos_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Producto.objects.filter(nombre="Producto Test").exists())


# ==========================================
# TESTS DE ENDPOINTS PÚBLICOS
# ==========================================
class PublicEndpointsTests(APITestCase):
    """Tests para endpoints públicos (landing page)"""

    def setUp(self):
        self.client = APIClient()
        # Crear datos de prueba
        self.portafolio = Portafolio.objects.create(
            nombre="Portafolio Público",
            ruta="portafolio-publico",
            activo=True,
        )
        self.producto = Producto.objects.create(
            portafolio=self.portafolio,
            nombre="Producto Público",
            precio=50000,
            destacado=True,
            activo=True,
            tipo_usuario="general",
        )

    def test_productos_landing_publico(self):
        """Test: Cualquier persona puede ver productos destacados"""
        response = self.client.get(reverse("productos-landing-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_promociones_landing_publico(self):
        """Test: Cualquier persona puede ver promociones"""
        Promocion.objects.create(nombre="Promo Test", titulo="Título", activo=True)
        response = self.client.get(reverse("promociones-landing-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ==========================================
# TESTS DE HEALTH CHECK
# ==========================================
class HealthCheckTests(APITestCase):
    """Tests para endpoints de health check"""

    def test_health_check_basico(self):
        """Test: Health check básico responde"""
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)["status"], "healthy")
        self.assertIn("timestamp", response.content.decode())

    def test_health_check_completo(self):
        """Test: Health check completo con DB"""
        response = self.client.get("/api/health/full/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["checks"]["database"]["status"], "connected")
