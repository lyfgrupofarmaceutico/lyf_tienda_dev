# L&F Grupo Farmacéutico - Explicación del Proyecto

## Resumen General

L&F Grupo Farmacéutico es una plataforma de comercio electrónico construida con un backend en Django REST API y un frontend en React + Vite. Sus funciones principales incluyen:

- Catálogo de productos, portafolio, cursos y promociones
- Carrito de compras con checkout por WhatsApp
- Control de acceso basado en roles (`general`, `profesional`, `is_admin`)
- Registro de auditoría para todas las operaciones CRUD de administración
- Envío de correos por Gmail SMTP o Resend
- PostgreSQL en producción, SQLite en desarrollo local

---

## Backend (Django)

- Django 6.0 + Django REST Framework con autenticación JWT (SimpleJWT)
- Endpoints bajo `/api/v1/` con limitación de tasa (3 intentos de restablecer contraseña por hora)
- Endpoints de verificación de estado: `/api/health/` y `/api/health/full/`
- Modelos: `User`, `OneTimePassword`, `Portafolio`, `Producto`, `Promocion`, `Curso`, `HistorialCompra`, `AuditoriaCambio`
- Modelo de usuario personalizado que soporta los tres roles
- Suite de pruebas en `api/tests.py` para autenticación, modelos y endpoints

## Frontend (React + Vite)

- React 19 + Vite + Tailwind CSS
- Gestión de estado con Zustand, persistido en localStorage (`authStore`, `cartStore`)
- Obtención de datos con TanStack React Query con reintentos automáticos
- Tablas con TanStack React Table (paginación incluida)
- Enrutamiento con React Router; rutas protegidas por `ProtectedRoute.jsx`
- Manejo global de errores con un `ErrorBoundary` que envuelve toda la app
- Alias de rutas (`@src`, `@components`, `@auth`, `@dashboard`, `@landing`) definidos en `vite.config.js`
- Rutas principales: `/` (landing), `/auth` (login/registro/OTP), `/dashboard` (usuarios), `/admin` (administración)

---

## Archivos Clave

- `backend/api/views.py` – todas las vistas de la API (autenticación + CRUD)
- `backend/api/models.py` – modelos de datos
- `backend/api/tests.py` – suite de pruebas
- `backend/api/health.py` – endpoints de verificación de estado
- `backend/tienda/settings.py` – configuración de Django (PostgreSQL, logging, CORS)
- `backend/tienda/urls.py` – enrutamiento de la API
- `frontend/src/App.jsx` – enrutamiento principal y guardas de autenticación
- `frontend/src/store/authStore.js` – estado de autenticación con JWT persistido
- `frontend/src/store/useCartStore.js` – estado del carrito persistido en localStorage
- `frontend/src/lib/axiosInstance.js` – instancia de Axios con interceptores (refresco automático de token)

---

## Despliegue en Producción (Dokploy)

Servicios necesarios: PostgreSQL 15+, Backend (Django + Gunicorn, puerto 8000), Frontend (Nginx sirviendo la app de React compilada, puerto 80), y un volumen Docker para archivos multimedia.

Se definen variables de entorno para backend y frontend:

**Backend:**

```
SECRET_KEY=<clave_segura>
DEBUG=False
ALLOWED_HOSTS=tudominio.com,api.tudominio.com
DATABASE_URL=postgres://user:pass@host:5432/dbname
EMAIL_HOST_USER=lyfcomercializadora.info@gmail.com
EMAIL_HOST_PASSWORD=<app_password>
FRONTEND_URL_PROD=https://tudominio.com
CORS_ALLOWED_ORIGINS=https://tudominio.com
```

**Frontend:**

```
VITE_API_URL=https://api.tudominio.com/api/v1
VITE_WHATSAPP_NUMBER=573182825718
```

Pasos de despliegue: crear servicio PostgreSQL, crear servicios de backend y frontend, configurar variables de entorno, configurar dominio y SSL, ejecutar migraciones y crear un superusuario vía el admin de Django.

---

## Pruebas

- Backend: `python manage.py test api` ejecuta todas las pruebas; se pueden ejecutar clases específicas (ej. `AuthenticationTests`).
- Frontend: No hay suite de pruebas configurada aún.

---

## Subida de Archivos

Actualmente usa almacenamiento local bajo `backend/media/`. Para producción con Dokploy, los archivos se guardan en el volumen Docker `backend_media`. Se sugiere una migración futura a S3/R2 mediante `django-storages` para escalabilidad.

---

## Comandos Principales

### Backend (Django)

```bash
cd backend
python manage.py runserver          # Servidor de desarrollo
python manage.py migrate            # Ejecutar migraciones
python manage.py makemigrations     # Crear migraciones
python manage.py createsuperuser    # Crear usuario administrador
python manage.py test api           # Ejecutar todas las pruebas
python manage.py test api --verbosity=2   # Salida detallada de pruebas)
```

### Frontend

```bash
cd frontend
npm run dev                         # Servidor de desarrollo (puerto 5173)
npm run build                       # Compilación para producción
npm run preview                     # Vista previa de la compilación para producción
npm run lint                        # Ejecutar ESLint
```

### Docker (desarrollo local)

```bash
docker-compose up -d                # Iniciar todos los servicios
docker-compose logs -f              # Ver logs
docker-compose down                 # Detener todos los servicios
docker-compose exec backend python manage.py migrate  # Ejecutar migraciones
```

---

## En Resumen

Es una solución full‑stack de comercio electrónico con un backend Django que expone APIs REST seguras por JWT, y un frontend en React/Vite que maneja la visualización de productos, autenticación de usuarios, gestión del carrito y una interfaz basada en roles. Incluye registro de auditoría, notificaciones por correo y está preparado para despliegue con Docker en Dokploy, con una clara separación de responsabilidades y un código modular.
