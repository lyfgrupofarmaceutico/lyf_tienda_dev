import { useEffect, useState } from "react";
import {
  X,
  AlertTriangle,
  Loader2,
  UserPen,
} from "lucide-react";

const ModalEstadoUsuario = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de continuar?",
  textConfirm = "Aceptar",
  isLoading = false,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Pequeño delay para permitir transición de salida
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isMounted && !isOpen) return null;

  return (
    <div>
      {/* Overlay con transición CSS */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
        aria-labelledby="delete-modal-title"
      >
        {/* Modal con transición CSS */}
        <div
          className={`bg-bgSecundario rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-bgOscuro rounded-t-md px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full">
                <AlertTriangle
                  className="h-6 w-6 text-destacado"
                  aria-hidden="true"
                />
              </div>
              <h2
                id="delete-modal-title"
                className="text-xl font-bold text-txtBlanco"
              >
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded-r-lg">
              <p className="text-yellow-600 font-medium">
                Esta acción afectará los permisos o el acceso del usuario a la
                plataforma.
              </p>
            </div>

            <div className="space-y-2">{message}</div>
          </div>

          {/* Footer */}
          <div className="bg-bgPrimario rounded-b-md px-6 py-2 border-t border-gray-300 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`
                px-4 py-1.5 rounded-md font-medium transition-colors border border-gray-400 hover:bg-gray-100 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}}
              `}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                px-4 py-1.5 rounded-md font-medium text-white transition-colors flex items-center justify-center gap-2 bg-bgOscuro hover:bg-primario ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
              `}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <>
                  <UserPen className="h-4 w-4" aria-hidden="true" />
                  {textConfirm}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEstadoUsuario;
