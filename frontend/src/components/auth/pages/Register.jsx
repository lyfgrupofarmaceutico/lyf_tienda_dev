import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "@src/api/authService";
import { ArrowLeft, Check, X, Eye, EyeOff } from "lucide-react";

// Imagenes del equipo
import logo from "@assets/logo-grupo.webp";

const Register = () => {
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  // Validación de contraseña en tiempo real
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    passwordsMatch:
      formData.password &&
      formData.password2 &&
      formData.password === formData.password2,
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error cuando el usuario escribe
    if (error) setError("");
  };

  // Validar contraseñas
  const validatePasswords = () => {
    if (formData.password !== formData.password2) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return false;
    }
    return true;
  };

  // Validar email
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return false;
    }
    return true;
  };

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos vacíos
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.password
    ) {
      setError("Por favor completa todos los campos");
      return;
    }

    // Validar email
    if (!validateEmail()) return;

    // Validar contraseñas
    if (!validatePasswords()) return;

    setLoading(true);
    setError("");

    try {
      // Llamar al servicio de registro
      const response = await authService.register(
        formData.email,
        formData.first_name,
        formData.last_name,
        formData.password,
        formData.password2,
      );

      // Si el registro fue exitoso, redirigir a OTP
      if (response.data) {
        // Guardar email temporalmente para la página de OTP
        localStorage.setItem("pending_verification_email", formData.email);

        // Redirigir a verificación OTP
        navigate("/auth/otp");
      }
    } catch (err) {
      console.error("Error en registro:", err);

      // Manejar diferentes tipos de errores
      if (err.response) {
        if (err.response.status === 400) {
          setError(
            err.response.data?.password || "Este correo ya está registrado",
          );
        } else if (err.response.status === 500) {
          setError("Error del servidor. Por favor intenta más tarde");
        } else {
          setError(err.response.data?.detail || "Error al registrar usuario");
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
          <h1 className="text-primario text-2xl font-bold">Crear cuenta</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="first_name" className="block text-sm font-medium">
              Nombre
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
              autoComplete="off"
              className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />

            <label htmlFor="last_name" className="block text-sm font-medium">
              Apellido
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Tu apellido"
              required
              autoComplete="off"
              className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium file focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />

            <label htmlFor="email" className="block text-sm font-medium">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              autoComplete="off"
              className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium file focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />

            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
                autoComplete="off"
                className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium file focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10"
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

            {/* Validación en tiempo real */}
            {formData.password && (
              <div className="space-y-1 text-xs">
                <p
                  className={`flex items-center gap-1 ${passwordValidation.minLength ? "text-green-600" : "text-red-600"}`}
                >
                  {passwordValidation.minLength ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Al menos 8 caracteres
                </p>
                <p
                  className={`flex items-center gap-1 ${passwordValidation.hasUppercase ? "text-green-600" : "text-red-600"}`}
                >
                  {passwordValidation.hasUppercase ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Al menos una letra mayúscula
                </p>
                <p
                  className={`flex items-center gap-1 ${passwordValidation.hasNumber ? "text-green-600" : "text-red-600"}`}
                >
                  {passwordValidation.hasNumber ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Al menos un número
                </p>
              </div>
            )}

            <label htmlFor="password2" className="block text-sm font-medium">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="password2"
                name="password2"
                type={showPassword2 ? "text" : "password"}
                value={formData.password2}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                autoComplete="off"
                className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium file focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={
                  showPassword2 ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword2 ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Validación de coincidencia */}
            {formData.password2 && (
              <p
                className={`flex items-center gap-1 text-xs ${passwordValidation.passwordsMatch ? "text-green-600" : "text-red-600"}`}
              >
                {passwordValidation.passwordsMatch ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                Las contraseñas{" "}
                {passwordValidation.passwordsMatch
                  ? "coinciden"
                  : "no coinciden"}
              </p>
            )}
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div
              className="bg-red-100 text-red-600 px-4 py-1.5 rounded relative"
              role="alert"
            >
              <span className="block sm:inline text-sm">{error}</span>
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
                Creando...
              </span>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
