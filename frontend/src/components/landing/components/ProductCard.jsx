import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Info, Star, X } from "lucide-react";

const ProductCard = ({ id, img, nombre, descripcion }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayRef = useRef(null);
  const infoButtonRef = useRef(null);

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

  // Manejar clic fuera del overlay (opcional pero recomendado)
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

  const toggleOverlay = (e) => {
    e.stopPropagation();
    setShowOverlay((prev) => !prev);

    // Enfocar botón de info al cerrar para mejor accesibilidad
    if (showOverlay && infoButtonRef.current) {
      setTimeout(() => infoButtonRef.current.focus(), 100);
    }
  };

  return (
    <div
      className="bg-bgPrimario rounded-md shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden group flex flex-col h-full relative border-2 border-gray-300"
      aria-label={`Producto: ${nombre}`}
      role="article"
    >
      {/* Imagen con relación de aspecto consistente + badges + icono de info */}
      <div className="relative aspect-square bg-bgSecundario flex items-center justify-center overflow-hidden">
        {/* Badges de descuento y destacado */}
        <div className="absolute top-3 left-3 bg-destacado text-xs font-bold px-2 py-1 rounded-full shadow-xl z-10 flex items-center gap-1">
          <Star className="h-4 w-4 fill-destacado" aria-hidden="true" />
          Destacado
        </div>

        {/* Icono de información (siempre visible) */}
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

      {/* Contenido normal (siempre visible) */}
      <div className="flex flex-col p-4 flex-grow">
        <h3
          className="font-bold text-base mb-2 line-clamp-2 min-h-[2.75rem]"
          title={nombre}
        >
          {nombre}
        </h3>
        <p className="text-xs line-clamp-4">{descripcion}</p>
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

export default ProductCard;
