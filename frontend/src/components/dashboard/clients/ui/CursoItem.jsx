import { useState } from "react";
import { User, Video, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const CursoItem = ({ id, img, titulo, descripcion, profesional, link }) => {
  const [imageError, setImageError] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // ABRIR VIDEO CON VALIDACIÓN Y FEEDBACK
  const handleOpenVideo = async () => {
    if (isOpening) return;

    if (!link) {
      toast.error(`Enlace no disponible para "${titulo}"`, {
        icon: "⚠️",
        duration: 3000,
      });
      return;
    }

    setIsOpening(true);

    try {
      // VALIDAR URL ANTES DE ABRIR
      const url = new URL(link, window.location.origin);

      // ABRIR EN NUEVA PESTAÑA CON ATRIBUTOS DE SEGURIDAD
      const videoWindow = window.open(
        url.href,
        "_blank",
        "noopener,noreferrer",
      );

      // TOAST DE ÉXITO
      toast.success(`Reproduciendo: ${titulo}`, {
        icon: "🎬",
        duration: 3500,
      });
    } catch (error) {
      console.error("Error al abrir video:", error);

      if (error.message?.includes("blocked")) {
        message = "Permite ventanas emergentes para ver el curso";
      } else if (error instanceof TypeError) {
        message = "URL del curso inválida. Contacta al administrador.";
      }
    } finally {
      setIsOpening(false);
    }
  };

  // MANEJO DE ERROR DE IMAGEN
  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = "none";
    toast(`Portada no disponible para "${titulo}"`, {
      icon: <AlertCircle className="text-amber-500" size={20} />,
      duration: 2000,
    });
  };

  return (
    <div
      className={`
        bg-bgPrimario rounded-md shadow-md hover:shadow-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1  focus-visible:outline-none border-2 border-gray-300`}
      role="article"
      aria-labelledby={`curso-title-${id}`}
    >
      {/* Imagen del curso con fallback robusto */}
      <div
        className="aspect-video bg-bgPrimario flex items-center justify-center relative overflow-hidden"
        aria-label={`Portada del curso: ${titulo}`}
      >
        {imageError ? (
          // FALLBACK CUANDO LA IMAGEN FALLA
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Video className="w-8 h-8 text-gray-200" aria-hidden="true" />
            </div>
          </div>
        ) : img ? (
          // IMAGEN CON MANEJO DE ERROR Y HOVER EFFECT
          <img
            src={img}
            alt={`Portada del curso: ${titulo}`}
            className={`
              w-full h-full object-cover transition-transform duration-300
              hover:scale-105
            `}
            loading="eager"
            onError={handleImageError}
            aria-hidden="true"
          />
        ) : (
          // PLACEHOLDER POR DEFECTO
          <div className="text-gray-300">
            <Video className="h-16 w-16" aria-hidden="true" />
          </div>
        )}

        {/* BADGE DE VIDEO */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white rounded-full p-1.5 shadow-lg">
          <Video className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      {/* Contenido del curso */}
      <div className="p-4 flex flex-col flex-grow">
        <h3
          id={`curso-title-${id}`}
          className="font-bold text-lg mb-2 text-primario line-clamp-1"
          title={titulo}
        >
          {titulo || "Curso sin título"}
        </h3>

        <p
          className="text-sm flex-grow line-clamp-2 min-h-[2rem]"
          title={descripcion}
        >
          {descripcion || "Sin descripción disponible"}
        </p>

        <div className="flex items-center gap-2 text-sm mb-4">
          <User className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="font-medium line-clamp-1" title={profesional}>
            {profesional || "Profesional no especificado"}
          </span>
        </div>

        {/* BOTÓN DE ACCIÓN MEJORADO */}
        <button
          onClick={handleOpenVideo}
          disabled={isOpening || !link}
          className={`
            w-full py-2.5 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-all duration-200 transform focus:outline-none 
            ${
              isOpening || !link
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primario hover:bg-enfasis text-txtBlanco focus:ring-primario hover:scale-[1.02]"
            }
          `}
          aria-busy={isOpening}
          aria-label={
            link
              ? `Ver curso: ${titulo}`
              : `Enlace no disponible para ${titulo}`
          }
          title={link ? "Abrir video en nueva pestaña" : "Enlace no disponible"}
        >
          {isOpening ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Abriendo...</span>
            </>
          ) : (
            <>
              <Video className="h-4 w-4" aria-hidden="true" />
              <span>Ver curso</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CursoItem;
