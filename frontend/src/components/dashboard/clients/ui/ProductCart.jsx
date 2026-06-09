import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@src/store/useCartStore";
import {
  Minus,
  Plus,
  ShoppingCart,
  Star,
  ImageIcon,
  X,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

const ProductCart = ({
  id,
  img,
  nombre,
  precio,
  descuento,
  precioDescuento,
  destacado,
  descripcion,
}) => {
  const { cart, addItemToCart, updateItemToCart, deleteItemToCart } =
    useCartStore();

  const cartItem = cart.find((item) => item.id === id);
  const cantidad = cartItem ? cartItem.cantidad : 0;
  const [isAdding, setIsAdding] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayRef = useRef(null);
  const infoButtonRef = useRef(null);

  // Calcular precio final (con o sin descuento)
  const precioFinal = precioDescuento || precio;
  const tieneDescuento = descuento > 0;

  // Cerrar overlay al presionar Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowOverlay(false);
      }
    };

    if (showOverlay) {
      document.addEventListener("keydown", handleEscape);
      // Enfocar overlay para mejor accesibilidad
      overlayRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showOverlay]);

  // Manejar clic fuera del overlay
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target) &&
        showOverlay
      ) {
        setShowOverlay(false);
      }
    };

    if (showOverlay) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOverlay]);

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);
    try {
      if (cantidad > 0) {
        updateItemToCart({
          id,
          img,
          nombre,
          precio,
          descuento,
          precioDescuento,
          cantidad: cantidad + 1,
        });
      } else {
        addItemToCart({
          id,
          img,
          nombre,
          precio,
          descuento,
          precioDescuento,
          cantidad: 1,
        });
      }

      toast.success(`"${nombre}" agregado al carrito`, {
        icon: "🛒",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      toast.error("Error al agregar. Intenta nuevamente.", {
        icon: "⚠️",
        duration: 2500,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubtract = () => {
    if (cantidad <= 1) {
      deleteItemToCart(id);
      toast.success(`"${nombre}" eliminado del carrito`, {
        icon: "🗑️",
        duration: 1500,
      });
    } else {
      updateItemToCart({
        id,
        img,
        nombre,
        precio,
        descuento,
        precioDescuento,
        cantidad: cantidad - 1,
      });
      toast("-1", {
        icon: "⬇️",
        duration: 800,
      });
    }
  };

  const handleAdd = () => {
    updateItemToCart({
      id,
      img,
      nombre,
      precio,
      descuento,
      precioDescuento,
      cantidad: cantidad + 1,
    });
    toast("+1", {
      icon: "⬆️",
      duration: 800,
    });
  };

  const toggleOverlay = (e) => {
    e.stopPropagation();
    setShowOverlay((prev) => !prev);

    // Enfocar botón de info al cerrar
    if (showOverlay && infoButtonRef.current) {
      setTimeout(() => infoButtonRef.current.focus(), 100);
    }
  };

  return (
    <div
      className="bg-bgPrimario rounded-md shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full relative border-2 border-gray-300"
      aria-label={`Producto: ${nombre}`}
      role="article"
    >
      {/* Imagen con relación de aspecto consistente */}
      <div className="relative aspect-square bg-bgSecundario flex items-center justify-center overflow-hidden">
        {/* Badges de descuento y destacado */}
        {tieneDescuento && (
          <div className="absolute top-3 right-3 bg-descuento text-xs font-bold px-2 py-1 rounded-full shadow-xl z-10">
            -{descuento}%
          </div>
        )}
        {destacado && (
          <div className="absolute top-3 left-3 bg-destacado text-xs font-bold px-2 py-1 rounded-full shadow-xl z-10 flex items-center gap-1">
            <Star className="h-4 w-4 fill-destacado" aria-hidden="true" />
            Destacado
          </div>
        )}

        {/* Icono de información */}
        <button
          ref={infoButtonRef}
          onClick={toggleOverlay}
          className="absolute bottom-3 right-3 z-20 p-1.5 hover:text-secundario transition-colors"
          aria-expanded={showOverlay}
          aria-controls={`product-overlay-${id}`}
          aria-label={`Ver descripción completa de ${nombre}`}
        >
          <Info className="h-6 w-6" aria-hidden="true" />
        </button>

        {img ? (
          <img
            src={img}
            alt={nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="eager"
          />
        ) : (
          <div className="text-gray-300 p-4">
            <ImageIcon className="w-16 h-16" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Contenido normal */}
      <div className="flex flex-col p-4 flex-grow">
        <h3
          className="font-bold text-base line-clamp-2 min-h-[2.75rem]"
          title={nombre}
        >
          {nombre}
        </h3>

        {/* Precios */}
        <div className="flex items-baseline gap-2 mb-4">
          {tieneDescuento && (
            <span className="text-sm line-through">
              ${precio.toLocaleString("es-CO")}
            </span>
          )}
          <span className="text-xl font-bold text-primario">
            ${precioFinal.toLocaleString("es-CO")}
          </span>
        </div>

        {/* Controles de carrito */}
        {cantidad === 0 ? (
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full py-2.5 bg-primario hover:bg-enfasis text-txtBlanco font-medium rounded-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] transition-all duration-300"
            aria-label={`Agregar ${nombre} al carrito`}
          >
            {isAdding ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                Agregando...
              </span>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Añadir al carrito
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-between bg-white border-2 border-primario rounded-md p-1">
            <button
              onClick={handleSubtract}
              className="p-2 rounded transition-colors"
              aria-label={`Reducir cantidad de ${nombre}`}
            >
              <Minus className="h-4 w-4 text-primario" aria-hidden="true" />
            </button>
            <span className="w-8 text-center font-medium text-primario">
              {cantidad}
            </span>
            <button
              onClick={handleAdd}
              className="p-2 rounded transition-colors"
              aria-label={`Aumentar cantidad de ${nombre}`}
            >
              <Plus className="h-4 w-4 text-primario" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* OVERLAY TOGGLEABLE (70% opacidad) */}
      {showOverlay && (
        <div
          ref={overlayRef}
          id={`product-overlay-${id}`}
          tabIndex="-1"
          className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4 z-20"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`overlay-title-${id}`}
        >
          {/* Botón de cerrar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOverlay(false);
            }}
            className="absolute top-3 right-3 text-txtBlanco p-1.5 hover:text-txtNegro hover:bg-gray-100/50 rounded-full transition-colors"
            aria-label="Cerrar descripción"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Título del overlay */}
          <h4
            id={`overlay-title-${id}`}
            className="text-lg font-bold text-destacado mb-4 max-w-full px-2"
          >
            {nombre}
          </h4>

          {/* Descripción completa centrada */}
          <p className="text-sm md:text-base text-txtBlanco max-w-full px-4 leading-relaxed whitespace-pre-line max-h-[80%] overflow-y-auto">
            {descripcion ||
              "Producto de alta calidad para profesionales de la salud. Formulado con estándares internacionales de pureza y eficacia."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCart;
