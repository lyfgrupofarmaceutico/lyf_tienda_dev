import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "@src/api/authService";
import { Eye, EyeOff } from "lucide-react";

// Imagenes del equipo
import logo from "@assets/logo-grupo.webp";

const Login = () => {
  const navigate = useNavigate();

  // Verificar si ya está autenticado al montar
  useEffect(() => {
    if (authService.isAuthenticated()) {
      // Redirigir según rol actual
      const user = authService.getUser();
      navigate(user?.is_admin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [navigate]);

  // Estado del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Obtener respuesta completa
      const response = await authService.login(email, password);

      // USAR DATOS DE LA RESPUESTA DIRECTAMENTE
      if (response.is_admin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          // Detectar error de correo no verificado
          if (
            err.response.data?.detail?.includes("verificado") ||
            err.response.data?.detail?.includes("verified")
          ) {
            setError(
              "Tu correo no ha sido verificado. Revisa tu bandeja de entrada.",
            );
          } else {
            setError("Correo o contraseña incorrectos");
          }
        } else if (err.response.status === 400) {
          setError("Por favor verifica tus credenciales");
        } else if (err.response.status === 500) {
          setError("Error del servidor. Por favor intenta más tarde");
        } else {
          setError(err.response.data?.detail || "Error al iniciar sesión");
        }
      } else if (err.request) {
        setError("No se pudo conectar con el servidor");
      } else {
        setError("Error al procesar la solicitud");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-4 sm:p-8 bg-white/60 backdrop-blur-sm rounded-md">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center">
          <div className="inline-flex w-full justify-start">
            {/* Logo - Grupo Farmacéutico */}
            <Link to="/">
              <img src={logo} alt="logo" className="h-14 object-contain" />
            </Link>
          </div>
        </div>

        <div className="flex justify-center pb-2">
          <h1 className="text-primario text-2xl font-bold text-primary">
            Iniciar sesión
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              required
              autoComplete="off"
            />

            <label
              htmlFor="password"
              className="block text-sm font-medium mt-4"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10"
                required
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div
              className="bg-red-100 text-red-600 text-sm px-3 py-1.5 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primario px-6 py-1.5 rounded-md text-txtBlanco font-semibold hover:bg-enfasis disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <div className="flex items-center justify-start pt-2">
          <Link
            to="/auth/password-reset"
            className="text-primario text-sm font-semibold hover:text-secundario"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="flex items-center justify-center text-center pt-4">
          <p className="text-sm font-semibold">¿No tienes una cuenta?</p>
          <Link
            to="/auth/register"
            className="pl-2 text-sm text-primario font-semibold hover:text-secundario"
          >
            Crear una cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
