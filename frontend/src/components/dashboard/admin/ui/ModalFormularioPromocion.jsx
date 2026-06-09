import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  Save,
  Plus,
  AlertCircle,
  ExternalLink,
  Trash2,
  Tags,
} from "lucide-react";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// CONSTANTES - Configuración centralizada
// ─────────────────────────────────────────────────────────────
const VALIDATION = {
  MIN_LENGTH: 3,
  MAX_LENGTH: {
    nombre: 50,
    titulo: 50,
    subtitulo: 50,
    descripcion: 100,
    texto_boton: 30,
    link: 600,
  },
};

const FILE_CONFIG = {
  MAX_SIZE_MB: 5,
  ACCEPTED_TYPES: "image/*",
};

const INITIAL_FORM_DATA = {
  nombre: "",
  titulo: "",
  subtitulo: "",
  descripcion: "",
  texto_boton: "",
  link: "",
  activo: true,
};

const DEFAULT_BUTTON_TEXT = "Ver más";

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
const ModalFormularioPromocion = ({
  isOpen,
  onClose,
  onSubmit,
  promocion = null,
  isCreating = true,
  isLoading = false,
}) => {
  const bannerInputRef = useRef(null);
  const modalContentRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [bannerFile, setBannerFile] = useState(null);
  const [existingBanner, setExistingBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);

  // ───────────────────────────────────────────────────────────
  // Efecto principal: Manejo de apertura/cierre del modal
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Inicializar formulario según modo
      if (promocion && !isCreating) {
        loadPromocionData(promocion);
      } else {
        resetForm();
      }

      setErrors({});
      setIsClosing(false);

      // Focus management para accesibilidad
      setTimeout(() => {
        modalContentRef.current?.querySelector("input")?.focus();
      }, 100);

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    } else {
      setIsClosing(true);
      // Pequeño delay para la animación de salida
      const timer = setTimeout(() => {
        setIsClosing(false);
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, promocion, isCreating]);

  // ───────────────────────────────────────────────────────────
  // Cargar datos de promoción existente
  // ───────────────────────────────────────────────────────────
  const loadPromocionData = useCallback((data) => {
    setFormData({
      nombre: data.nombre || "",
      titulo: data.titulo || "",
      subtitulo: data.subtitulo || "",
      descripcion: data.descripcion || "",
      texto_boton: data.texto_boton || DEFAULT_BUTTON_TEXT,
      link: data.link || "",
      activo: data.activo !== undefined ? data.activo : true,
    });

    setBannerFile(null);
    setExistingBanner(data.banner || null);
    setBannerPreview(data.banner || null);
  }, []);

  // ───────────────────────────────────────────────────────────
  // Resetear formulario a estado inicial
  // ───────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData({ ...INITIAL_FORM_DATA });
    setBannerFile(null);
    setExistingBanner(null);
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  }, []);

  // ───────────────────────────────────────────────────────────
  // Manejo de archivo de banner
  // ───────────────────────────────────────────────────────────
  const handleBannerFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen", {
        icon: "❌",
        duration: 3000,
      });
      e.target.value = "";
      return;
    }

    // Validar tamaño
    const maxSizeBytes = FILE_CONFIG.MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(
        `El archivo no debe superar los ${FILE_CONFIG.MAX_SIZE_MB}MB`,
        {
          icon: "❌",
          duration: 3000,
        },
      );
      e.target.value = "";
      return;
    }

    // Actualizar estado
    setBannerFile(file);
    setExistingBanner(null);

    // Generar preview
    const reader = new FileReader();
    let isCancelled = false;

    reader.onload = (event) => {
      if (!isCancelled && event.target?.result) {
        setBannerPreview(event.target.result);
      }
    };

    reader.onerror = () => {
      toast.error("Error al leer el archivo", { icon: "❌", duration: 2000 });
    };

    reader.readAsDataURL(file);

    // Cleanup function para evitar memory leaks
    return () => {
      isCancelled = true;
      reader.abort?.();
    };

    toast.success("Banner seleccionado correctamente", { duration: 2000 });
  }, []);

  const clearBanner = useCallback(() => {
    setBannerFile(null);
    setExistingBanner(null);
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  }, []);

  // ───────────────────────────────────────────────────────────
  // Validación del formulario
  // ───────────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validación de banner (requerido siempre que no haya uno existente)
    if (!bannerFile && !existingBanner) {
      newErrors.banner = "El banner es requerido";
    }

    // Validación de campos de texto
    const textFields = [
      { key: "nombre", label: "El nombre" },
      { key: "titulo", label: "El título" },
      { key: "subtitulo", label: "El subtítulo" },
      { key: "descripcion", label: "La descripción" },
      { key: "texto_boton", label: "El texto del botón" },
    ];

    textFields.forEach(({ key, label }) => {
      const value = formData[key]?.trim();
      if (!value) {
        newErrors[key] = `${label} es requerido`;
      } else if (value.length < VALIDATION.MIN_LENGTH) {
        newErrors[key] =
          `${label} debe tener al menos ${VALIDATION.MIN_LENGTH} caracteres`;
      }
    });

    // Validación de link
    const link = formData.link?.trim();
    if (!link) {
      newErrors.link = "El link es requerido";
    } else if (!/^https?:\/\//i.test(link)) {
      newErrors.link = "El link debe comenzar con http:// o https://";
    } else if (link.length > VALIDATION.MAX_LENGTH.link) {
      newErrors.link = `El link debe tener máximo ${VALIDATION.MAX_LENGTH.link} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, bannerFile, existingBanner]);

  // ───────────────────────────────────────────────────────────
  // Manejo del submit del formulario
  // ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Corrige los errores del formulario", {
        icon: "❌",
        duration: 2000,
      });
      return;
    }

    try {
      let payload;

      if (bannerFile) {
        // Usar FormData cuando hay nuevo archivo
        payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            payload.append(key, value);
          }
        });
        payload.append("banner", bannerFile);
      } else {
        // Enviar JSON manteniendo banner existente
        payload = {
          ...formData,
          link: formData.link.trim() || null,
        };
      }

      await onSubmit(payload);

      // Solo cerrar si no hay error
      if (!errors.banner) {
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar promoción:", error);

      // Normalizar mensaje de error
      const errorMessage =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.message || "Error al guardar la promoción";

      toast.error(`Error: ${errorMessage}`, {
        icon: "❌",
        duration: 4000,
      });
    }
  };

  // ───────────────────────────────────────────────────────────
  // Memoización de validaciones derivadas
  // ───────────────────────────────────────────────────────────
  const isLinkValid = useMemo(() => {
    const link = formData.link?.trim();
    if (!link) return null;
    return /^https?:\/\//i.test(link);
  }, [formData.link]);

  const getCharacterCount = useCallback(
    (field) => {
      const maxLength = VALIDATION.MAX_LENGTH[field];
      const currentLength = formData[field]?.length || 0;
      return `${currentLength}/${maxLength}`;
    },
    [formData],
  );

  // ───────────────────────────────────────────────────────────
  // Handlers para inputs (optimizados con useCallback)
  // ───────────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    [],
  );

  const handleCheckboxChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      activo: e.target.checked,
    }));
  }, []);

  // ───────────────────────────────────────────────────────────
  // Renderizado condicional del modal
  // ───────────────────────────────────────────────────────────
  if (!isOpen && !isClosing) return null;

  return (
    <div>
      <div
        className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
        aria-labelledby="promocion-modal-title"
      >
        {/* Modal Content */}
        <div
          ref={modalContentRef}
          className={`bg-bgSecundario rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] transform transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="bg-bgOscuro rounded-t-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCreating ? (
                <Plus className="h-6 w-6 text-white" aria-hidden="true" />
              ) : (
                <Tags className="h-6 w-6 text-white" aria-hidden="true" />
              )}
              <h2
                id="promocion-modal-title"
                className="text-xl font-bold text-white"
              >
                {isCreating
                  ? "Crear nueva promoción"
                  : `Editar: ${promocion?.nombre || "Promoción"}`}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          {/* Body - Formulario */}
          <div className="p-4 overflow-y-auto max-h-[70vh]">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Nombre de campaña */}
              <FormField
                id="nombre"
                label="Nombre de la campaña"
                value={formData.nombre}
                onChange={handleInputChange("nombre")}
                error={errors.nombre}
                helperText="Solo será visto por el administrador"
                maxLength={VALIDATION.MAX_LENGTH.nombre}
                placeholder="Ej: Campaña Black Friday"
                required
              />

              {/* Banner */}
              <BannerField
                bannerFile={bannerFile}
                existingBanner={existingBanner}
                bannerPreview={bannerPreview}
                bannerInputRef={bannerInputRef}
                errors={errors}
                onFileChange={handleBannerFileChange}
                onClear={clearBanner}
              />

              {/* Título y Subtítulo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="titulo"
                  label="Título principal"
                  value={formData.titulo}
                  onChange={handleInputChange("titulo")}
                  error={errors.titulo}
                  maxLength={VALIDATION.MAX_LENGTH.titulo}
                  placeholder="Ej: ¡Oferta especial!"
                  required
                />
                <FormField
                  id="subtitulo"
                  label="Subtítulo"
                  value={formData.subtitulo}
                  onChange={handleInputChange("subtitulo")}
                  error={errors.subtitulo}
                  maxLength={VALIDATION.MAX_LENGTH.subtitulo}
                  placeholder="Ej: 15% descuento"
                  required
                />
              </div>

              {/* Descripción y Texto botón */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="descripcion"
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={handleInputChange("descripcion")}
                  error={errors.descripcion}
                  maxLength={VALIDATION.MAX_LENGTH.descripcion}
                  placeholder="Ej: En referencias seleccionadas."
                  // as="textarea"
                  rows={1}
                  required
                />
                <FormField
                  id="texto_boton"
                  label="Texto del botón"
                  value={formData.texto_boton}
                  onChange={handleInputChange("texto_boton")}
                  error={errors.texto_boton}
                  maxLength={VALIDATION.MAX_LENGTH.texto_boton}
                  placeholder="Ej: ¡Aprovecha ahora!"
                  required
                />
              </div>

              {/* Enlace */}
              <LinkField
                id="link"
                value={formData.link}
                onChange={handleInputChange("link")}
                error={errors.link}
                isLinkValid={isLinkValid}
              />

              {/* Estado activo */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={handleCheckboxChange}
                    className="form-checkbox accent-primario h-5 w-5 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Promoción activa (visible en la página)
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-8">
                  Las promociones inactivas no se mostrarán en el sitio público
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <footer className="bg-bgPrimario rounded-b-lg px-4 py-3 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus:border-primario"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              form="promocion-form"
              disabled={isLoading}
              className={`
              px-4 py-2.5 rounded-lg font-medium text-white transition-colors 
              flex items-center justify-center gap-2 bg-bgOscuro hover:bg-primario 
              focus:outline-none focus:ring-1 focus:ring-primario focus:ring-offset-2
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  {isCreating ? "Creando..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {isCreating ? "Crear promoción" : "Guardar cambios"}
                </>
              )}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES (Extraídos para mejor organización)
// ─────────────────────────────────────────────────────────────

const FormField = ({
  id,
  label,
  value,
  onChange,
  error,
  helperText,
  maxLength,
  placeholder,
  required = false,
  as = "input",
  rows = 1,
  ...props
}) => {
  const Component = as;
  const characterCount = maxLength
    ? `${value?.length || 0}/${maxLength}`
    : null;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-destructivo ml-1">*</span>}
      </label>

      <Component
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primario transition-colors ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        rows={as === "textarea" ? rows : undefined}
        autoComplete="off"
        {...props}
      />

      <div className="flex justify-between items-center">
        <div className="min-h-[1.25rem]">
          {error ? (
            <p
              id={`${id}-error`}
              className="text-red-500 text-sm flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {error}
            </p>
          ) : helperText ? (
            <p className="text-xs text-gray-400">{helperText}</p>
          ) : null}
        </div>
        {characterCount && (
          <p className="text-gray-400 text-xs" aria-live="polite">
            {characterCount}
          </p>
        )}
      </div>
    </div>
  );
};

const BannerField = ({
  bannerFile,
  existingBanner,
  bannerPreview,
  bannerInputRef,
  errors,
  onFileChange,
  onClear,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Banner de la promoción
        <span className="text-destructivo ml-1">*</span>
      </label>

      <div className="flex gap-3">
        <input
          ref={bannerInputRef}
          type="file"
          onChange={onFileChange}
          accept={FILE_CONFIG.ACCEPTED_TYPES}
          required={!existingBanner}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primario file:text-white hover:file:bg-enfasis cursor-pointer"
        />
        {(bannerFile || existingBanner) && (
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
            aria-label="Eliminar banner"
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="min-h-[1.25rem]">
          {errors.banner && (
            <p
              id="banner-error"
              className="text-red-500 text-sm flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {errors.banner}
            </p>
          )}
        </div>
        <p className="text-gray-400 text-xs">
          (PNG, JPG, WebP). Máximo {FILE_CONFIG.MAX_SIZE_MB}MB.
        </p>
      </div>

      {bannerPreview && (
        <div className="mt-3 border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="flex justify-center">
            <img
              src={bannerPreview}
              alt="Vista previa del banner"
              className="max-h-48 w-auto object-contain rounded"
              onError={(e) => {
                e.target.onerror = null;
                onClear();
                toast.error("Error al cargar la imagen", {
                  icon: "❌",
                  duration: 2000,
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const LinkField = ({ id, value, onChange, error, isLinkValid }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        URL de destino
        <span className="text-destructivo ml-1">*</span>
      </label>

      <div className="flex gap-2">
        <input
          id={id}
          type="url"
          value={value}
          onChange={onChange}
          placeholder="Ej: https://lyfgrupofarmaceutico.com/auth"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primario transition-colors ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          autoComplete="off"
          required
        />

        <button
          type="button"
          disabled={!isLinkValid}
          className={`p-3 rounded-lg flex items-center gap-2 transition-colors ${
            isLinkValid
              ? "bg-primario hover:bg-enfasis text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          onClick={() =>
            isLinkValid && window.open(value, "_blank", "noopener,noreferrer")
          }
          aria-label={
            isLinkValid ? "Abrir URL en nueva pestaña" : "URL inválida"
          }
        >
          <ExternalLink className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium hidden sm:inline whitespace-nowrap">
            Abrir URL
          </span>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="min-h-[1.25rem]">
          {error && (
            <p
              id={`${id}-error`}
              className="text-red-500 text-sm flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>
        <p className="text-gray-400 text-xs">
          Debe comenzar con http:// o https://
        </p>
      </div>
    </div>
  );
};

export default ModalFormularioPromocion;
