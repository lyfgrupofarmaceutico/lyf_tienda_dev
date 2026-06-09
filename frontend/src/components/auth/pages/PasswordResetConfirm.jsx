import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import authService from "@src/api/authService";

// Imagenes del equipo
import logo from "@assets/logo-grupo.webp";

const PasswordResetConfirm = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.setNewPassword(
        uidb64,
        token,
        newPassword,
        confirmPassword,
      );
      setSuccess(true);

      //  Esperamos 3 segundos y llevamos el usuarios al login
      setTimeout(() => {
        navigate("/auth/login");
        setNewPassword("");
        setConfirmPassword("");
      }, 3000);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response?.data?.password);
        } else if (err.response.status === 401) {
          setError(
            err.response?.data?.detail || "El link no es válido o ha expirado",
          );

          //  Esperamos 3 segundos y llevamos el usuarios al login
          setTimeout(() => {
            navigate("/auth/login");
            setNewPassword("");
            setConfirmPassword("");
          }, 3000);
        }
      } else if (err.request) {
        setError("No se pudo conectar con el servidor");

        //  Esperamos 3 segundos y llevamos el usuarios al login
        setTimeout(() => {
          navigate("/auth/login");
          setNewPassword("");
          setConfirmPassword("");
        }, 3000);
      } else {
        setError("Error al actualizar contraseña");
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
          <h1 className="text-primario text-2xl font-bold">Nueva contraseña</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              required
              autoComplete="off"
            />

            <label
              htmlFor="password"
              className="block text-sm font-medium mt-4"
            >
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              required
              autoComplete="off"
            />
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div
              className="bg-red-100 text-red-600 px-4 py-1.5 rounded text-sm"
              role="alert"
            >
              <span className="block">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-600 px-4 py-1.5 rounded">
              ¡Contraseña actualizada!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primario px-6 py-1.5 rounded-md text-txtBlanco font-semibold hover:bg-enfasis disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Actualizando..." : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
