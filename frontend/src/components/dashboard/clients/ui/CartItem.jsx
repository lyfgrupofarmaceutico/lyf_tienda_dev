import { useCartStore } from "@src/store/useCartStore";
import { XCircle, Image as ImageIcon, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const CartItem = ({
  id,
  img,
  nombre,
  precio,
  precioDescuento,
  cantidad,
  descuento,
}) => {
  const { deleteItemToCart, updateItemToCart } = useCartStore();

  // CALCULAR PRECIOS
  const precioUnitario = precioDescuento ?? precio;
  const precioTotalItem = precioUnitario * cantidad;
  const tieneDescuento = descuento && descuento > 0;

  // MANEJAR ELIMINACIÓN CON CONFIRMACIÓN
  const handleDelete = () => {
    // Confirmación visual con toast
    toast(
      (t) => (
        <div className="flex flex-col gap-3 max-w-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">¿Eliminar producto?</p>
              <p className="text-sm text-gray-400">
                "{nombre}" será eliminado de tu carrito
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                deleteItemToCart(id);
                toast.success(`"${nombre}" eliminado`, {
                  icon: "🗑️",
                  duration: 1500,
                });
              }}
              className="flex-1 bg-destructivo hover:bg-red-600 text-white text-sm font-medium py-1.5 rounded"
            >
              Eliminar
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-1.5 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        icon: null,
        style: { background: "#1f2937", padding: "16px" },
      },
    );
  };

  // MANEJAR CAMBIO DE CANTIDAD
  const handleQuantityChange = (nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    updateItemToCart({
      id,
      img,
      nombre,
      precio,
      precioDescuento,
      descuento,
      cantidad: nuevaCantidad,
    });

    // Feedback visual sutil
    if (nuevaCantidad > cantidad) {
      toast.success(`+1 ${nombre}`, { icon: "➕", duration: 800 });
    } else {
      toast("Cantidad actualizada", { icon: "✏️", duration: 800 });
    }
  };

  return (
    <div
      className="flex items-start justify-between py-3 border-b border-border last:border-b-0"
      role="listitem"
      aria-label={`Producto: ${nombre}, Cantidad: ${cantidad}`}
    >
      {/* Imagen y detalles */}
      <div className="flex gap-3 flex-1">
        {/* Imagen con fallback */}
        <div className="flex-shrink-0 w-14 h-14 rounded-md overflow-hidden bg-gray-100 border border-border flex items-center justify-center">
          {img ? (
            <img
              src={img}
              alt={`Imagen de ${nombre}`}
              className="w-full h-full object-contain p-1"
              loading="eager"
              onError={(e) => {
                e.target.onerror = null;
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="text-gray-400">
              <ImageIcon className="h-6 w-6" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Detalles del producto */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm text-textBlack line-clamp-1"
            title={nombre}
          >
            {nombre || "Producto sin nombre"}
          </h3>

          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            {/* Cantidad y precio unitario */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xs font-medium bg-bgOscuro/10 text-textBlack px-2 py-0.5 rounded">
                {cantidad}x
              </span>

              <div className="flex items-baseline gap-1">
                {tieneDescuento ? (
                  <>
                    <span className="text-xs text-destructivo line-through">
                      ${precio.toLocaleString("es-CO")}
                    </span>
                    <span className="text-sm font-bold text-primario">
                      ${precioUnitario.toLocaleString("es-CO")}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-primario">
                    ${precioUnitario.toLocaleString("es-CO")}
                  </span>
                )}
              </div>
            </div>

            {/* Precio total del item */}
            <div className="text-right">
              <span
                className="text-sm font-bold text-textBlack"
                aria-label={`Total por ${cantidad} unidades: $${precioTotalItem.toLocaleString("es-CO")}`}
              >
                ${precioTotalItem.toLocaleString("es-CO")}
              </span>
              {tieneDescuento && (
                <div className="text-xs text-destructivo mt-0.5">
                  -{descuento}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botón de eliminar */}
      <button
        onClick={handleDelete}
        className="ml-2 p-1.5 text-gray-400 hover:text-destructivo hover:bg-destructivo/10 rounded-full transition-colors flex-shrink-0"
        aria-label={`Eliminar ${nombre} del carrito`}
        title="Eliminar producto"
      >
        <XCircle className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default CartItem;
