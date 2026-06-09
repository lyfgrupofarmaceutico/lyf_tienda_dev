import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const location = useLocation();

  // Detectar cuando Zustand termina de hidratar
  useEffect(() => {
    // Esperar un tick para asegurar que el store esté hidratado
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Mostrar loader SOLO durante hidratación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgPrimario">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primario"></div>
      </div>
    );
  }

  // No autenticado → login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Requiere admin pero no lo es → dashboard
  if (adminOnly && !isAdmin) {
    console.warn("Acceso denegado: se requiere rol de administrador");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
