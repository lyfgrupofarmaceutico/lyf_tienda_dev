from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import routers
from api import views
from api.health import health_check, health_check_full

# Router para los modelos
router = routers.DefaultRouter()
router.register(r"usuarios", views.UserViewSet, basename="usuarios")
router.register(r"portafolios", views.PortafolioViewSet, basename="portafolios")
router.register(r"cursos", views.CursoViewSet, basename="cursos")
router.register(r"productos", views.ProductoViewSet, basename="productos")
router.register(r"promociones", views.PromocionViewSet, basename="promociones")
router.register(
    r"historial-compras", views.HistorialCompraViewSet, basename="historial-compras"
)
router.register(
    r"auditoria-cambios", views.AuditoriaCambioViewSet, basename="auditoria-cambios"
)
router.register(
    r"portafolios-dashboard",
    views.PortafolioPublicoViewSet,
    basename="portafolios-dashboard",
)
router.register(
    r"productos-dashboard",
    views.ProductoConRolViewSet,
    basename="productos-dashboard",
)
router.register(
    r"cursos-dashboard", views.CursoPublicoViewSet, basename="cursos-dashboard"
)
router.register(
    r"productos-landing",
    views.ProductoPublicoViewSet,
    basename="productos-landing",
)
router.register(
    r"promociones-landing",
    views.PromocionPublicoViewSet,
    basename="promociones-landing",
)


urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # Health checks
    path("api/health/", health_check, name="health-check"),
    path("api/health/full/", health_check_full, name="health-check-full"),
    # API v1
    path("api/v1/", include(router.urls)),
    # Endpoints de autenticación
    path("api/v1/auth/register/", views.RegisterUserView.as_view(), name="register"),
    path(
        "api/v1/auth/verify-email/",
        views.VerifyUserEmailView.as_view(),
        name="verify-email",
    ),
    path("api/v1/auth/resend-otp/", views.ResendOtpView.as_view(), name="resend-otp"),
    path("api/v1/auth/login/", views.LoginUserView.as_view(), name="login"),
    path(
        "api/v1/auth/profile/", views.TestAuthenticationView.as_view(), name="profile"
    ),
    path(
        "api/v1/auth/password-reset/",
        views.PasswordResetView.as_view(),
        name="password-reset",
    ),
    path(
        "api/v1/auth/password-reset-confirm/<uidb64>/<token>/",
        views.PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path(
        "api/v1/auth/set-new-password/",
        views.SetNewPasswordView.as_view(),
        name="set-new-password",
    ),
    path("api/v1/auth/logout/", views.LogoutUserView.as_view(), name="logout"),
    # Refresh token (renovar access token)
    path(
        "api/v1/auth/token-refresh/", TokenRefreshView.as_view(), name="token-refresh"
    ),
    path("api/v1/contact/", views.ContactoViewSet.as_view(), name="contact-form"),
]

# Configuración para servir archivos multimedia en desarrollo
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
