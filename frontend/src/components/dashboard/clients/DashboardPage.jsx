import { useEffect } from "react";
import { useAuthStore } from "@src/store/authStore";
import { useCartStore } from "@src/store/useCartStore";
import { Outlet } from "react-router-dom";
import CartShopping from "@dashboard/clients/pages/CartShopping";
import Header from "@dashboard/clients/pages/Header";
import Footer from "@landing/pages/Footer";
import ScrollToTop from "@landing/components/ui/scroll-top";
import WhatsAppButton from "@landing/components/WhatsAppButton";

const DashboardPage = () => {
  const { isOpen, toogleClose } = useCartStore();
  const user = useAuthStore((state) => state.user);

  // Validar si existe un usuario
  useEffect(() => {
    if (!user) {
      // Redundancia de seguridad (aunque ProtectedRoute ya lo hace)
      window.location.href = "/auth/login";
    }
  }, [user]);

  // Verificar hidratación completa antes de renderizar
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgPrimario">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primario"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bgSecundario">
      <Header />
      <WhatsAppButton />

      <main className="bg-bgSecundario">
        <ScrollToTop />
        <Outlet />
      </main>

      {/* OVERLAY PARA FONDO OSCURO DEL CARRITO */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={toogleClose}
          aria-hidden="true"
        />
      )}

      {/* CARRITO POSICIONADO FUERA DEL FLUJO PRINCIPAL */}
      <CartShopping isOpen={isOpen} onClose={toogleClose} />

      <Footer />
    </div>
  );
};

export default DashboardPage;
