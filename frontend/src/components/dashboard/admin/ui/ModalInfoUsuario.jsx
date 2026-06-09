import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  X,
  User,
  Mail,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatearFechas } from "@src/utils/formatearFechas";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// CONSTANTES - Configuración centralizada
// ─────────────────────────────────────────────────────────────
const ROLES_CONFIG = {
  administrador: {
    text: "Administrador",
    className: "text-primario",
    icon: <ShieldCheck className="h-4 w-4 text-primario" aria-hidden="true" />,
  },
  profesional: {
    text: "Profesional",
    className: "text-blue-600",
    icon: <User className="h-4 w-4 text-blue-600" aria-hidden="true" />,
  },
  general: {
    text: "General",
    className: "text-green-600",
    icon: <User className="h-4 w-4 text-green-600" aria-hidden="true" />,
  },
};

const STATUS_CONFIG = {
  pendiente: {
    text: "Pendiente de verificación",
    className: "text-amber-600",
    icon: <Clock className="h-4 w-4 text-amber-600" aria-hidden="true" />,
  },
  activo: {
    text: "Activo",
    className: "text-green-600",
    icon: <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />,
  },
  inactivo: {
    text: "Inactivo",
    className: "text-red-600",
    icon: <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />,
  },
};

const DEFAULT_USER_AVATAR = "U";
const TRANSITION_DURATION = 300;

// ─────────────────────────────────────────────────────────────
// UTILIDADES (Fuera del componente para evitar recreación)
// ─────────────────────────────────────────────────────────────
const getInitialLetter = (name) => {
  if (!name || typeof name !== "string") return DEFAULT_USER_AVATAR;
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : DEFAULT_USER_AVATAR;
};

const getRoleBadge = (rol, user) => {
  if (user) {
    return ROLES_CONFIG.administrador;
  }
  return ROLES_CONFIG[rol] || ROLES_CONFIG.general;
};

const getStatusBadge = (estado, isVerified) => {
  if (!isVerified) return STATUS_CONFIG.pendiente;
  return STATUS_CONFIG[estado] || STATUS_CONFIG.inactivo;
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
const ModalInfoUsuario = ({ isOpen, user, onClose }) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  // Memoizar utilidades de fecha para evitar recreación
  const { formatDateTime, formatDate } = useMemo(() => formatearFechas(), []);

  // ───────────────────────────────────────────────────────────
  // Efecto principal: Manejo de apertura/cierre, teclado y foco
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setIsClosing(false);

      // Focus management: enfocar botón de cerrar al abrir
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, TRANSITION_DURATION);

      // Keyboard support: cerrar con Escape
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
        // Focus trap básico: Tab cycling
        if (e.key === "Tab" && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = previousOverflow;
        clearTimeout(timer);
      };
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
        document.body.style.overflow = "unset";
      }, TRANSITION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // ───────────────────────────────────────────────────────────
  // Memoización de datos derivados del usuario
  // ───────────────────────────────────────────────────────────
  const userData = useMemo(() => {
    if (!user) return null;

    const roleBadge = getRoleBadge(user.rol || "general", user.is_admin);
    const statusBadge = getStatusBadge(
      user.estado || "inactivo",
      user.is_verified,
    );
    const avatarLetter = getInitialLetter(user.nombre);

    return {
      fullName: `${user.nombre || ""} ${user.apellido || ""}`.trim(),
      email: user.correo || "Sin correo",
      roleBadge,
      statusBadge,
      avatarLetter,
      fechaRegistro: user.fechaRegistro || "",
      ultimoAcceso: user.ultimoAcceso || "",
      isAdmin: user.is_admin || "",
      isVerified: Boolean(user.is_verified),
    };
  }, [user]);

  // ───────────────────────────────────────────────────────────
  // Handlers
  // ───────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // ───────────────────────────────────────────────────────────
  // Renderizado condicional
  // ───────────────────────────────────────────────────────────
  if (!isOpen && !isClosing) return null;
  if (!userData) {
    // Mostrar toast de error si no hay usuario pero el modal está abierto
    if (isOpen) {
      toast.error("No se pudo cargar la información del usuario", {
        icon: "❌",
        duration: 3000,
      });
    }
    return null;
  }

  return (
    <div>
      <div
        className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-${TRANSITION_DURATION} ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
        aria-labelledby="user-info-modal-title"
        aria-describedby="user-info-modal-description"
      >
        {/* Modal Content */}
        <div
          ref={modalRef}
          className={`bg-bgSecundario rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] transform transition-all duration-${TRANSITION_DURATION} ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="bg-bgOscuro rounded-t-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-white" aria-hidden="true" />
              <h2
                id="user-info-modal-title"
                className="text-xl font-bold text-white"
              >
                Información del usuario
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors focus:outline-none"
              aria-label="Cerrar modal de información"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          {/* Body */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Información personal */}
            <section aria-labelledby="personal-info-heading">
              <h3
                id="personal-info-heading"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                Información personal
              </h3>
              <div className="bg-bgPrimario rounded-lg p-4 space-y-3 mt-2">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-lg bg-primario flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <span className="text-2xl font-bold text-txtBlanco">
                      {userData.avatarLetter}
                    </span>
                  </div>

                  {/* Datos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-gray-900 capitalize break-words">
                      {userData.fullName || "Usuario sin nombre"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail
                        className="h-4 w-4 text-gray-400 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-gray-600 break-all">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Rol y estado */}
            <section
              aria-labelledby="role-status-heading"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <h3 id="role-status-heading" className="sr-only">
                Rol y estado del usuario
              </h3>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Rol del usuario
                </label>
                <div
                  className={`px-3 py-2 bg-bgPrimario rounded-lg flex items-center gap-2 ${userData.roleBadge.className}`}
                >
                  {userData.roleBadge.icon}
                  <span className="font-medium">{userData.roleBadge.text}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Estado actual
                </label>
                <div
                  className={`px-3 py-2 bg-bgPrimario rounded-lg flex items-center gap-2 ${userData.statusBadge.className}`}
                >
                  {userData.statusBadge.icon}
                  <span className="font-medium">
                    {userData.statusBadge.text}
                  </span>
                </div>
              </div>
            </section>

            {/* Fechas importantes */}
            <section aria-labelledby="activity-heading">
              <h3
                id="activity-heading"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                Actividad reciente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {/* Fecha de registro */}
                <div className="flex bg-bgPrimario rounded-lg p-3 items-start gap-3">
                  <Calendar
                    className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Fecha de registro</p>
                    <p className="font-medium text-gray-900">
                      {userData.fechaRegistro
                        ? formatDate(userData.fechaRegistro)
                        : "N/A"}
                    </p>
                    {userData.fechaRegistro && (
                      <p className="text-xs text-gray-400">
                        {formatDateTime(userData.fechaRegistro, false, true)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Último acceso */}
                <div className="flex bg-bgPrimario rounded-lg p-3 items-start gap-3">
                  <Clock
                    className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Último acceso</p>
                    <p className="font-medium text-gray-900">
                      {userData.ultimoAcceso
                        ? formatDate(userData.ultimoAcceso)
                        : "Nunca"}
                    </p>
                    {userData.ultimoAcceso && (
                      <p className="text-xs text-gray-400">
                        {formatDateTime(userData.ultimoAcceso, false, true)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Verificación de correo */}
            <section aria-labelledby="verification-heading">
              <h3
                id="verification-heading"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                Verificación de correo
              </h3>
              <div
                className={`mt-2 px-3 py-2 rounded-lg bg-bgPrimario flex items-center gap-2 ${
                  userData.isVerified ? "text-green-600" : "text-amber-600"
                }`}
              >
                {userData.isVerified ? (
                  <>
                    <CheckCircle
                      className="h-4 w-4 text-green-600"
                      aria-hidden="true"
                    />
                    <span className="font-medium">Correo verificado</span>
                  </>
                ) : (
                  <>
                    <Clock
                      className="h-4 w-4 text-amber-600"
                      aria-hidden="true"
                    />
                    <span className="font-medium">Esperando verificación</span>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="bg-bgPrimario rounded-b-lg px-4 py-3 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:border-primario"
            >
              Cerrar
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoUsuario;
