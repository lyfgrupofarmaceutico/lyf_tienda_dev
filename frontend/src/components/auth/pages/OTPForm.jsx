import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import authService from "@src/api/authService";

// Imagenes del equipo
import logo from "@assets/logo-grupo.webp";

const OTPForm = () => {
  const navigate = useNavigate();

  // Estado del componente
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Obtener email del localStorage al montar
  useEffect(() => {
    const pendingEmail = localStorage.getItem("pending_verification_email");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // Si no hay email, redirigir al registro
      navigate("/auth/register");
    }

    // Iniciar countdown para reenviar
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Manejar cambios en el input OTP
  const handleChange = (e) => {
    // Solo permitir números
    const value = e.target.value.replace(/[^0-9]/g, "");
    setOtp(value);
    if (error) setError("");
  };

  // Verificar código OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    // Validar que el código tenga 6 dígitos
    if (otp.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Llamar al servicio de verificación OTP
      await authService.verifyOTP(otp);

      // Si la verificación fue exitosa
      setSuccess(true);

      // Pequeño delay para mostrar mensaje de éxito
      setTimeout(() => {
        // Limpiar email temporal
        localStorage.removeItem("pending_verification_email");

        // Redirigir al login para que inicie sesión
        navigate("/auth/login");
      }, 2500);
    } catch (err) {
      console.error("Error al verificar OTP:", err);

      // Manejar diferentes tipos de errores
      if (err.response) {
        if (err.response.status === 400) {
          setError(
            err.response.data?.mensaje ||
              "El código ha expirado. Solicita uno nuevo",
          );
        } else if (err.response.status === 404) {
          setError("El código de verificación no es válido");
        } else {
          setError("Error al verificar el código");
        }
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código OTP
  const handleResend = async () => {
    if (!canResend) return;

    setOtp("");
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Llamar al servicio para reenviar OTP
      await authService.resendOTP(email);

      // Reiniciar countdown
      setCountdown(60);
      setCanResend(false);

      // Iniciar nuevo countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setError("Nuevo código enviado a tu correo");
    } catch (err) {
      console.error("Error al reenviar OTP:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al reenviar el código");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-4 sm:p-8 bg-white/60 backdrop-blur-sm rounded-md">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-4">
          <div className="flex mb-4 items-center justify-between">
            {/* Logo - Grupo Farmacéutico */}
            <a href="/" className="cursor-pointer">
              <img src={logo} alt="logo" className="h-14 object-contain" />
            </a>
            <div className="text-end">
              <Link to="/auth/register" className="inline-flex">
                <button className="flex items-center text-primario hover:text-secundario">
                  <ArrowLeft className="size-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-2">
          <h1 className="text-primario text-3xl font-bold">Verificar código</h1>
        </div>

        <p className="text-center text-sm font-semibold pb-4">
          Hemos enviado un código de 6 dígitos a:{" "}
          <span className="font-semibold text-primario">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1 flex justify-center">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              value={otp}
              onChange={handleChange}
              placeholder="000000"
              className="flex w-48 rounded-md px-3 py-1.5 text-center text-sm font-bold file:border-0 file:bg-bgPrimario file focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed md:text-sm"
              autoFocus
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
          {success && (
            <div
              className="bg-green-100 text-green-600 px-3 py-1,5 rounded text-sm"
              role="alert"
            >
              <span className="block">¡Correo verificado exitosamente!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full bg-primario px-6 py-1.5 rounded-md text-txtBlanco font-semibold hover:bg-enfasis transition-colors ${
              loading || otp.length !== 6 ? "opacity-50 cursor-not-allowed" : ""
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
                Verificando...
              </span>
            ) : (
              "Verificar código"
            )}
          </button>
        </form>

        <div className="flex items-center justify-center text-center pt-4">
          <p className="text-sm text-gray-600">¿No recibiste el código?</p>
          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`pl-2 text-primario font-semibold underline-offset-4 ${
              canResend && !loading
                ? "hover:underline hover:text-secundario cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            {canResend ? (
              "Reenviar código"
            ) : (
              <span className="text-xs">Reintentar en {countdown}s</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPForm;
