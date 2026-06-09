# L&F Grupo Farmacéutico

Plataforma de e-commerce para L&F Grupo Farmacéutico, desarrollada con Django REST API en el backend y React + Vite en el frontend.

## Características

- **Autenticación JWT**: Login, registro, verificación por OTP, recuperación de contraseña
- **Roles de usuario**: General, Profesional y Administrador
- **Catálogo de productos**: Filtrado por rol, productos destacados
- **Portafolios**: Gestión de marcas y colecciones
- **Cursos**: Contenido educativo en video
- **Promociones**: Banners promocionales configurables
- **Carrito de compras**: Checkout vía WhatsApp con persistencia local
- **Auditoría**: Registro de todas las acciones administrativas
- **Panel administrativo**: Gestión completa con tablas paginadas

## Tecnologías

### Backend

- Django 6.0
- Django REST Framework 3.16
- SimpleJWT para autenticación
- django-cors-headers
- django-environ para variables de entorno
- dj-database-url para PostgreSQL
- Pillow para manejo de imágenes
- Envío de correos vía Gmail SMTP o Resend

### Frontend

- React 19
- Vite 7
- Tailwind CSS
- Zustand (gestión de estado con persistencia)
- TanStack React Query (data fetching)
- TanStack React Table (tablas con paginación)
- React Router DOM
- Axios (con interceptors para token refresh)
- Lucide React (iconos)
- React Hot Toast (notificaciones)

## Requisitos

- Python 3.10+
- Node.js 18+
- npm o yarn
- PostgreSQL 15+ (producción)
- Docker (opcional, para desarrollo)

## Instalación - Desarrollo Local

### Opción A: Sin Docker (Recomendado para desarrollo)

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows)
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env basado en .env.example
cp .env.example .env

# Configurar variables en .env (ver backend/.env.example)

# Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor de desarrollo
python manage.py runserver
```

El backend estará disponible en `http://localhost:8000`

#### Frontend (otra terminal)

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env basado en .env.example
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Opción B: Con Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser --noinput
```

Servicios disponibles:

- Frontend: `http://localhost:80`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

## Estructura del Proyecto

```
lyf_tienda/
├── backend/
│   ├── .env.example              # Template de variables
│   ├── Dockerfile                # Build de producción
│   ├── entrypoint.sh             # Migraciones automáticas
│   ├── manage.py                 # Django CLI
│   ├── requirements.txt          # Dependencias Python
│   ├── api/
│   │   ├── models.py             # 8 modelos de datos
│   │   ├── views.py              # API endpoints
│   │   ├── serializers.py        # Serializadores
│   │   ├── health.py             # Health checks
│   │   ├── tests.py              # Tests completos
│   │   ├── utils.py              # OTP, emails
│   │   └── throttles.py          # Rate limiting
│   ├── tienda/
│   │   ├── settings.py           # Configuración Django
│   │   └── urls.py               # Rutas API
│   └── media/                    # Archivos subidos
│
├── frontend/
│   ├── .env.example              # Template de variables
│   ├── Dockerfile                # Build + Nginx
│   ├── nginx.conf                # Config SPA
│   ├── package.json
│   └── src/
│       ├── components/
│       │   ├── auth/             # Login, Registro, OTP
│       │   ├── dashboard/        # Admin + Usuario
│       │   └── landing/          # Landing page
│       ├── store/                # Zustand stores
│       ├── hooks/                # Custom hooks
│       ├── lib/                  # Axios instance
│       └── App.jsx               # Routing + ErrorBoundary
│
├── docker-compose.yml            # Orquestación local
├── EXPLICACION_PROYECTO.md       # Guía para desarrolladores
└── README.md                     # Este archivo
```

## API Endpoints

### Autenticación

| Método | Endpoint                         | Descripción                |
| ------ | -------------------------------- | -------------------------- |
| POST   | `/api/v1/auth/register/`         | Registro de usuario        |
| POST   | `/api/v1/auth/login/`            | Inicio de sesión           |
| POST   | `/api/v1/auth/logout/`           | Cerrar sesión              |
| POST   | `/api/v1/auth/verify-email/`     | Verificar correo con OTP   |
| POST   | `/api/v1/auth/resend-otp/`       | Reenviar código OTP        |
| POST   | `/api/v1/auth/password-reset/`   | Solicitar recuperación     |
| PATCH  | `/api/v1/auth/set-new-password/` | Nueva contraseña           |
| GET    | `/api/v1/auth/profile/`          | Obtener perfil (protegido) |
| POST   | `/api/v1/auth/token-refresh/`    | Renovar token              |

### Recursos (CRUD)

| Recurso           | Endpoint                     | Admin               | Público             |
| ----------------- | ---------------------------- | ------------------- | ------------------- |
| Usuarios          | `/api/v1/usuarios/`          | CRUD                | -                   |
| Portafolios       | `/api/v1/portafolios/`       | CRUD                | Lectura (dashboard) |
| Productos         | `/api/v1/productos/`         | CRUD                | Filtrado por rol    |
| Promociones       | `/api/v1/promociones/`       | CRUD                | Lectura (landing)   |
| Cursos            | `/api/v1/cursos/`            | CRUD                | Lectura (dashboard) |
| Historial Compras | `/api/v1/historial-compras/` | Lectura             | -                   |
| Auditoría         | `/api/v1/auditoria-cambios/` | Lectura con filtros | -                   |

### Health Check

| Endpoint            | Descripción              |
| ------------------- | ------------------------ |
| `/api/health/`      | Verifica servidor activo |
| `/api/health/full/` | Verifica servidor + DB   |

## Roles de Usuario

| Rol               | Permisos                                                    |
| ----------------- | ----------------------------------------------------------- |
| **General**       | Ver productos generales, realizar compras, acceder a cursos |
| **Profesional**   | Ver todos los productos, acceder a contenido exclusivo      |
| **Administrador** | Acceso completo al panel administrativo                     |

## Variables de Entorno

### Backend (.env)

```env
# Requeridas
SECRET_KEY=<generar_con_secrecy>
DEBUG=False                    # True solo para desarrollo local
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos (Desarrollo)
DATABASE_URL=sqlite:///db.sqlite3

# Base de datos (Producción)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Email
EMAIL_HOST_USER=correo@gmail.com
EMAIL_HOST_PASSWORD=app_password

# Frontend URLs
FRONTEND_URL_DEV=http://localhost:5173
FRONTEND_URL_PROD=https://tudominio.com

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://tudominio.com
```

### Frontend (.env)

```env
# Desarrollo
VITE_API_URL=http://localhost:8000/api/v1

# Producción
VITE_API_URL=https://api.tudominio.com/api/v1

# WhatsApp para pedidos
VITE_WHATSAPP_NUMBER=573182825718
```

## Desarrollo

### Tests (Backend)

```bash
cd backend
python manage.py test api                    # Todos los tests
python manage.py test api.AuthenticationTests  # Auth tests
python manage.py test api.ModelTests         # Modelo tests
python manage.py test api --verbosity=2      # Output detallado
```

### Ejecutar con Docker

```bash
# Levantar todo
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener
docker-compose down

# Reset completo (incluye volúmenes)
docker-compose down -v
```

## Despliegue en Producción (Dokploy)

### 1. Crear Servicios en Dokploy

#### PostgreSQL

- Imagen: `postgres:15-alpine`
- Variables: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- Volume: `/var/lib/postgresql/data`

#### Backend

- Build: `backend/Dockerfile`
- Puerto: 8000
- Variables de entorno (ver sección anterior)
- Volume: `/app/media`
- Health check: `/api/health/`

#### Frontend

- Build: `frontend/Dockerfile`
- Puerto: 80
- Variables: `VITE_API_URL`, `VITE_WHATSAPP_NUMBER`

### 2. Configuración de Dominio

1. Apuntar dominio al VPS (registro A)
2. Configurar SSL en Dokploy (automático con Let's Encrypt)
3. Actualizar `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS`

### 3. Primer Despliegue

```bash
# Conectar a contenedor backend
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

## Seguridad

- JWT con access token (30 min) y refresh token (7 días)
- Rate limiting: 3 password resets/hora por IP
- Auditoría de cambios para operaciones admin
- OTP para verificación de correo (10 min expiración)
- CORS configurado para dominios específicos
- DEBUG=False en producción
- Logging de errores configurado

## Solución de Problemas

### Backend no inicia

```bash
# Verificar .env existe
ls backend/.env

# Verificar dependencias
pip install -r requirements.txt

# Ver logs de error
python manage.py check --deploy
```

### Frontend no conecta al backend

```bash
# Verificar VITE_API_URL en frontend/.env
cat frontend/.env

# Verificar CORS en backend
# ALLOWED_HOSTS y CORS_ALLOWED_ORIGINS deben incluir el dominio del frontend
```

### Error de migraciones

```bash
# Resetear migraciones (desarrollo solo)
rm db.sqlite3
python manage.py migrate
```

## Licencia

Propiedad de L&F Grupo Farmacéutico. Todos los derechos reservados.
