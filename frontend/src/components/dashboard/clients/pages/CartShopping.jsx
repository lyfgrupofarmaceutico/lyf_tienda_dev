import { useState, useEffect, useMemo } from "react";
import { useCartStore } from "@src/store/useCartStore";
import { useAuthStore } from "@src/store/authStore";
import { generateWhatsAppMessage } from "@src/utils/generateWhatsAppMessage";
import { EmptyPage } from "../ui/EmptyPage";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import CartItem from "../ui/CartItem";

const CartShopping = ({ isOpen }) => {
  if (!isOpen) return null;

  const { toogleClose, cart, totalCart, resetCart } = useCartStore();

  // Nombre completo
  const fullName = useAuthStore((state) => {
    const user = state.user;
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`.toUpperCase();
    }
    return "CLIENTE";
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Memoizar el total para evitar recálculos
  const total = useMemo(() => totalCart(), [cart]);

  // FORMATEO DE TOTAL
  const formattedTotal = total.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

  // Gestión de foco y tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const previousActiveElement = document.activeElement;
    const closeButton = document.querySelector('[aria-label="Cerrar carrito"]');
    closeButton?.focus();

    const handleEscape = (e) => e.key === "Escape" && toogleClose();
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      previousActiveElement?.focus?.();
    };
  }, [isOpen, toogleClose]);

  // MANEJAR CONFIRMACIÓN DE COMPRA
  const handleNewOrder = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

      if (!whatsappNumber) {
        throw new Error("Número de WhatsApp no configurado");
      }

      // GENERAR MENSAJE CON LA UTILIDAD (sin problemas de encoding)
      const message = generateWhatsAppMessage(cart, total, fullName);
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

      // ABRIR WHATSAPP
      const whatsappWindow = window.open(whatsappUrl, "_blank");

      if (!whatsappWindow) {
        toast.error(
          "El navegador bloqueó la ventana de WhatsApp. Por favor, permite popups.",
          {
            icon: "🚫",
            duration: 6000,
          },
        );
        setIsProcessing(false);
        return;
      }

      // ÉXITO
      resetCart();
      toogleClose();

      toast.success("¡Tu pedido fue enviado a WhatsApp!", {
        icon: "🚀",
        duration: 6000,
      });
    } catch (error) {
      console.error("Error al procesar pedido:", error);
      toast.error(error.message || "Error al abrir WhatsApp", {
        icon: "⚠️",
        duration: 4000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <div className="flex flex-col bg-bgPrimario rounded-md w-full max-w-md max-h-[90vh] h-auto shadow-2xl">
        {/* Header del carrito */}
        <div className="flex items-center justify-between p-4">
          <h1 id="cart-title" className="text-xl font-bold">
            Tu Carrito ({cart.length})
          </h1>
          <button
            onClick={toogleClose}
            className="p-2 hover:text-destructivo transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenedor scrollable de productos */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <EmptyPage mensaje="Tu carrito está vacío" />
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <CartItem key={item.id} {...item} />
              ))}
            </div>
          )}
        </div>

        {/* Resumen y acciones */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-textBlack">Total a pagar:</span>
            <span className="text-xl font-bold text-primario">
              {formattedTotal}
            </span>
          </div>

          <div
            className={`rounded-md p-3 mb-4 text-sm ${cart.length === 0 ? "bg-yellow-100" : "bg-green-100"}`}
          >
            <p className="items-start">
              {cart.length === 0 ? (
                "Agrega productos para ver el resumen de tu compra."
              ) : (
                <>
                  Al confirmar, serás redirigido a{" "}
                  <span className="font-semibold">WhatsApp</span> con el resumen
                  de tu pedido para finalizar la compra.
                </>
              )}
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={handleNewOrder}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-bgOscuro hover:bg-secundario text-txtBlanco"
              }`}
              aria-busy={isProcessing}
              aria-label={
                isProcessing
                  ? "Procesando pedido..."
                  : "Confirmar compra y enviar a WhatsApp"
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>Confirmar compra</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartShopping;
