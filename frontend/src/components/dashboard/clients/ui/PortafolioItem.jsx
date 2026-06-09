import { useState } from "react";
import { Link } from "react-router-dom";
import { Image as ImageIcon, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const PortafolioItem = ({ id, ruta, logo, nombre, resumen }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // MANEJO ROBUSTO DE ERROR DE IMAGEN
  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = "none";
    toast(`Imagen no disponible para ${nombre}`, {
      icon: <AlertCircle className="text-amber-500" size={20} />,
      duration: 2000,
    });
  };

  return (
    <div
      className="flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={ruta}
        className="group block h-full"
        aria-label={`Ver portafolio: ${nombre}`}
      >
        <div
          className={`
            bg-bgPrimario rounded-md shadow-md hover:shadow-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1  focus-visible:outline-none border-2 border-gray-300`}
          role="article"
          aria-labelledby={`portafolio-title-${id}`}
        >
          {/* Imagen del portafolio con preview en hover */}
          <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
            {imageError ? (
              // FALLBACK CUANDO LA IMAGEN FALLA
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ImageIcon
                    className="w-8 h-8 text-gray-300"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-gray-500">Sin imagen</p>
              </div>
            ) : logo ? (
              // IMAGEN CON MANEJO DE ERROR
              <img
                src={logo}
                alt={`Logo de ${nombre}`}
                className={`
                  w-full h-full object-contain transition-transform duration-300
                  ${isHovered ? "scale-105" : "scale-100"}
                `}
                loading="eager"
                onError={handleImageError}
                aria-hidden="true"
              />
            ) : (
              // PLACEHOLDER POR DEFECTO
              <div className="w-32 h-32 flex items-center justify-center">
                <ImageIcon
                  className="w-20 h-20 text-gray-200"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          {/* Contenido del portafolio */}
          <div className="p-4 bg-bgPrimario flex flex-col flex-grow">
            <h3
              id={`portafolio-title-${id}`}
              className="font-bold text-lg mb-2 text-center line-clamp-1"
              title={nombre}
            >
              {nombre || "Portafolio sin nombre"}
            </h3>

            <p
              className="text-sm text-center text-gray-600 flex-grow line-clamp-2 min-h-[2.5rem]"
              title={resumen}
            >
              {resumen || "Sin descripción disponible"}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PortafolioItem;
