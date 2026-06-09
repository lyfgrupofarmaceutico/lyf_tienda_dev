import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@src/store/authStore";
import Sidebar from "@dashboard/admin/ui/Sidebar";
import ScrollToTop from "@landing/components/ui/scroll-top";

const DashboardAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const user = useAuthStore((state) => state.user);

  // PROTECCIÓN: Redirigir si no es admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      console.warn("Acceso denegado.");
      navigate("/dashboard", { replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Skeleton UI durante carga inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgPrimario">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fijo */}
      <Sidebar
        open={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      {/* Contenido principal scrollable */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 min-w-0 ${
          sidebarOpen ? "ml-16 md:ml-52" : "ml-16"
        } ml-0`}
      >
        {/* Contenido principal */}
        <main className="flex-1 p-3 md:p-6 overflow-y-auto">
          <ScrollToTop />
          <Outlet />
        </main>
      </div>

      {/* Overlay para mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardAdmin;
