import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import authService from "@src/api/authService";

// Imagenes del equipo
import logo from "@assets/logo-grupo.webp";

const PasswordReset = () => {
  const navigate = useNavigate();

  // Estado del componente
  const [emailForMessage, setEmailForMessage] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Iniciar countdown al montar (solo si hay éxito previo)
  useEffect(() => {
    // Solo iniciar countdown si ya se envió un correo
    if (success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            setEmail("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup del intervalo
      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [success, canResend, countdown]);

  // Manejar cambios en el input EMAIL
  const handleChange = (e) => {
    setEmail(e.target.value);
    // Limpiar error y éxito cuando el usuario escribe
    if (error) setError("");
    // Resetear estado de cooldown si el usuario modifica el email
    if (success || canResend) {
      setSuccess(false);
      setCanResend(false);
      setCountdown(60);
    }
  };

  // Validar email
  const validateEmail = () => {
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return false;
    }
    return true;
  };

  // Enviar solicitud de recuperación
  const handleSendResetLink = async (e) => {
    e.preventDefault();

    // Validar email
    if (!validateEmail()) return;

    setLoading(true);
    setError("");

    try {
      // Llamar al servicio para enviar link de recuperación
      await authService.passwordReset(email);
      // Guardamos una copia del correo para el mensaje
      setEmailForMessage(email);

      // RESETEAR ESTADO PARA NUEVO CICLO (clave para reenvíos)
      setSuccess(true);
      setCanResend(false);
      setCountdown(60);
      setError("");
    } catch (err) {
      console.error("Error al enviar link de recuperación:", err);

      // Manejar diferentes tipos de errores
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data?.message || "El correo no está activo");
        } else if (err.response.status === 404) {
          setError("No se encontró una cuenta con este correo");
        } else if (err.response.status === 403) {
          setError("Esta cuenta ya está verificada");
        } else if (err.response.status === 429) {
          setError(
            err.response.data?.detail ||
              "Demasiadas solicitudes. Por favor espera.",
          );

          //  Esperamos 3 segundos y llevamos el usuarios al login
          setTimeout(() => {
            setEmail("");
            setEmailForMessage("");
            navigate("/auth/login");
          }, 3000);
        } else {
          setError("Error al procesar la solicitud");
        }
      } else if (err.request) {
        setError("No se pudo conectar con el servidor");
      } else {
        setError("Error al enviar el correo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-4 sm:p-8 bg-white/60 backdrop-blur-sm rounded-md">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-between">
            {/* Logo - Grupo Farmacéutico */}
            <Link to="/">
              <img src={logo} alt="logo" className="h-14 object-contain" />
            </Link>
            <div className="text-end">
              <Link to="/auth/login" className="inline-flex">
                <button className="flex items-center text-primario hover:text-secundario">
                  <ArrowLeft className="size-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-2">
          <h1 className="text-primario text-2xl font-bold">
            Recuperar contraseña
          </h1>
        </div>

        <p className="text-center text-sm font-semibold pb-2">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña
        </p>

        <form onSubmit={handleSendResetLink} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              autoComplete="off"
              className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:bg-bgPrimario file:text-sm file:font-medium file focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed md:text-sm"
              disabled={success && !canResend}
            />
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div
              className="bg-red-100 text-red-600 px-3 py-1.5 rounded text-sm"
              role="alert"
            >
              <span className="block">{error}</span>
            </div>
          )}

          {/* Mostrar éxito */}
          {success && !canResend && (
            <div
              className="bg-green-100 text-green-600 px-4 py-1.5 rounded text-sm"
              role="alert"
            >
              <span className="block">
                Enlace de recuperación enviado a:{" "}
                <span className="font-semibold">{emailForMessage}</span>
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || (success && !canResend)}
            className={`w-full bg-primario px-6 py-1.5 rounded-md text-txtBlanco font-semibold hover:bg-enfasis transition-colors ${
              loading || !email || (success && !canResend)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                {success ? "Reenviando..." : "Enviando..."}
              </span>
            ) : success ? (
              "Reenviar enlace"
            ) : (
              "Enviar enlace de recuperación"
            )}
          </button>
        </form>

        {/* Mostrar contador solo si hay éxito y no se puede reenviar */}
        {success && !canResend && (
          <div className="flex items-center justify-center text-center pt-2">
            <p className="text-sm font-semibold">¿No recibiste el correo?</p>
            <span className="pl-2 text-sm font-semibold text-primario">
              Reintentar en {countdown}s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;
