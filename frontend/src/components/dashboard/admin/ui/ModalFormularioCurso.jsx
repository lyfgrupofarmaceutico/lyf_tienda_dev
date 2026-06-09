import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  Save,
  Plus,
  AlertCircle,
  Trash2,
  GraduationCap,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// CONSTANTES - Configuración centralizada
// ─────────────────────────────────────────────────────────────
const VALIDATION = {
  MIN_LENGTH: {
    titulo: 3,
    profesional: 5,
    descripcion: 10,
  },
  MAX_LENGTH: {
    titulo: 50,
    profesional: 50,
    descripcion: 100,
    link: 600,
  },
};

const FILE_CONFIG = {
  MAX_SIZE_MB: 5,
  ACCEPTED_TYPES: "image/*",
};

const INITIAL_FORM_DATA = {
  titulo: "",
  descripcion: "",
  profesional: "",
  link: "",
  activo: true,
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
const ModalFormularioCurso = ({
  isOpen,
  onClose,
  onSubmit,
  curso = null,
  isCreating = true,
  isLoading = false,
}) => {
  const fileInputRef = useRef(null);
  const modalContentRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [imgFile, setImgFile] = useState(null);
  const [existingImg, setExistingImg] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isPreviewingVideo, setIsPreviewingVideo] = useState(false);
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
      if (curso && !isCreating) {
        loadCursoData(curso);
      } else {
        resetForm();
      }

      setErrors({});
      setIsPreviewingVideo(false);
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
      // Delay para animación de salida
      const timer = setTimeout(() => {
        setIsClosing(false);
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, curso, isCreating]);

  // ───────────────────────────────────────────────────────────
  // Cargar datos de curso existente
  // ───────────────────────────────────────────────────────────
  const loadCursoData = useCallback((data) => {
    setFormData({
      titulo: data.titulo || "",
      descripcion: data.descripcion || "",
      profesional: data.profesional || "",
      link: data.link || "",
      activo: data.activo !== undefined ? data.activo : true,
    });

    setImgFile(null);
    setExistingImg(data.img || null);
    setImagePreview(data.img || null);
  }, []);

  // ───────────────────────────────────────────────────────────
  // Resetear formulario a estado inicial
  // ───────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData({ ...INITIAL_FORM_DATA });
    setImgFile(null);
    setExistingImg(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // ───────────────────────────────────────────────────────────
  // Manejo de archivo de imagen
  // ───────────────────────────────────────────────────────────
  const handleImageChange = useCallback((e) => {
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
    setImgFile(file);
    setExistingImg(null);

    // Generar preview con cleanup
    const reader = new FileReader();
    let isCancelled = false;

    reader.onload = (event) => {
      if (!isCancelled && event.target?.result) {
        setImagePreview(event.target.result);
      }
    };

    reader.onerror = () => {
      toast.error("Error al leer el archivo", { icon: "❌", duration: 2000 });
    };

    reader.readAsDataURL(file);

    toast.success("Imagen seleccionada correctamente", { duration: 2000 });

    // Cleanup para prevenir memory leaks
    return () => {
      isCancelled = true;
      reader.abort?.();
    };
  }, []);

  const clearImage = useCallback(() => {
    setImgFile(null);
    setExistingImg(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // ───────────────────────────────────────────────────────────
  // Validación del formulario
  // ───────────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validación de imagen (requerida siempre que no haya una existente)
    if (!imgFile && !existingImg) {
      newErrors.img = "La imagen de portada es requerida";
    }

    // Validación de título
    const titulo = formData.titulo?.trim();
    if (!titulo) {
      newErrors.titulo = "El título es requerido";
    } else if (titulo.length < VALIDATION.MIN_LENGTH.titulo) {
      newErrors.titulo = `El título debe tener al menos ${VALIDATION.MIN_LENGTH.titulo} caracteres`;
    }

    // Validación de profesional
    const profesional = formData.profesional?.trim();
    if (!profesional) {
      newErrors.profesional = "El profesional es requerido";
    } else if (profesional.length < VALIDATION.MIN_LENGTH.profesional) {
      newErrors.profesional = `El profesional debe tener al menos ${VALIDATION.MIN_LENGTH.profesional} caracteres`;
    }

    // Validación de descripción
    const descripcion = formData.descripcion?.trim();
    if (!descripcion) {
      newErrors.descripcion = "La descripción es requerida";
    } else if (descripcion.length < VALIDATION.MIN_LENGTH.descripcion) {
      newErrors.descripcion = `La descripción debe tener al menos ${VALIDATION.MIN_LENGTH.descripcion} caracteres`;
    }

    // Validación de link (opcional pero con formato válido si se proporciona)
    const link = formData.link?.trim();
    if (link && !/^https?:\/\//i.test(link)) {
      newErrors.link = "La URL debe comenzar con http:// o https://";
    } else if (link?.length > VALIDATION.MAX_LENGTH.link) {
      newErrors.link = `La URL debe tener máximo ${VALIDATION.MAX_LENGTH.link} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, imgFile, existingImg]);

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

      if (imgFile) {
        // Usar FormData cuando hay nuevo archivo
        payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            payload.append(key, key === "activo" ? String(value) : value);
          }
        });
        payload.append("img", imgFile);
      } else {
        // Enviar JSON manteniendo imagen existente
        payload = {
          ...formData,
          link: formData.link.trim() || null,
        };
      }

      await onSubmit(payload);
    } catch (error) {
      console.error("Error al guardar curso:", error);

      // Normalizar mensaje de error
      const errorMessage =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.message || "Error al guardar el curso";

      toast.error(`Error: ${errorMessage}`, {
        icon: "❌",
        duration: 4000,
      });
    }
  };

  // ───────────────────────────────────────────────────────────
  // Preview del video en nueva pestaña
  // ───────────────────────────────────────────────────────────
  const handlePreviewVideo = useCallback(() => {
    const link = formData.link?.trim();

    if (!link) {
      toast.error("Ingresa una URL de video válida primero", {
        icon: "❌",
        duration: 2000,
      });
      return;
    }

    if (!/^https?:\/\//i.test(link)) {
      toast.error("URL inválida. Debe comenzar con http:// o https://", {
        icon: "❌",
        duration: 3000,
      });
      return;
    }

    setIsPreviewingVideo(true);
    window.open(link, "_blank", "noopener,noreferrer");

    // Resetear estado después de un delay
    setTimeout(() => setIsPreviewingVideo(false), 2000);
  }, [formData.link]);

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
  // Handlers optimizados con useCallback
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
        aria-labelledby="curso-modal-title"
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
                <GraduationCap
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              )}
              <h2
                id="curso-modal-title"
                className="text-xl font-bold text-white"
              >
                {isCreating
                  ? "Crear nuevo curso"
                  : `Editar: ${curso?.titulo || "Curso"}`}
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
              {/* Imagen de portada */}
              <ImageField
                imgFile={imgFile}
                existingImg={existingImg}
                imagePreview={imagePreview}
                fileInputRef={fileInputRef}
                errors={errors}
                onFileChange={handleImageChange}
                onClear={clearImage}
              />

              {/* Título y Profesional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="titulo"
                  label="Título del curso"
                  value={formData.titulo}
                  onChange={handleInputChange("titulo")}
                  error={errors.titulo}
                  maxLength={VALIDATION.MAX_LENGTH.titulo}
                  placeholder="Título para el video"
                  required
                />
                <FormField
                  id="profesional"
                  label="Profesional"
                  value={formData.profesional}
                  onChange={handleInputChange("profesional")}
                  error={errors.profesional}
                  maxLength={VALIDATION.MAX_LENGTH.profesional}
                  placeholder="Nombre del profesional o entidad"
                  required
                  minLength={VALIDATION.MIN_LENGTH.profesional}
                />
              </div>

              {/* Descripción */}
              <FormField
                id="descripcion"
                label="Descripción del curso"
                value={formData.descripcion}
                onChange={handleInputChange("descripcion")}
                error={errors.descripcion}
                maxLength={VALIDATION.MAX_LENGTH.descripcion}
                placeholder="Describe el contenido y objetivos del video"
                as="textarea"
                rows={3}
                required
                minLength={VALIDATION.MIN_LENGTH.descripcion}
              />

              {/* Enlace del video */}
              <VideoLinkField
                id="link"
                value={formData.link}
                onChange={handleInputChange("link")}
                error={errors.link}
                isLinkValid={isLinkValid}
                isPreviewing={isPreviewingVideo}
                onPreview={handlePreviewVideo}
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
                    Curso activo (visible en la tienda)
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-8">
                  Los cursos inactivos no serán visibles para los usuarios en la
                  sección de cursos
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
              className="px-4 py-2.5 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:border-primario"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
              px-4 py-2.5 rounded-lg font-medium text-white transition-colors 
              flex items-center justify-center gap-2 bg-bgOscuro hover:bg-primario 
              focus:outline-none focus:ring-1 focus:ring-primario focus:ring-offset-2
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
              aria-busy={isLoading}
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
                  {isCreating ? "Crear curso" : "Guardar cambios"}
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
// COMPONENTES AUXILIARES
// ─────────────────────────────────────────────────────────────

const FormField = ({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  minLength,
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
        minLength={minLength}
        maxLength={maxLength}
        rows={as === "textarea" ? rows : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete="off"
        {...props}
      />

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
        {characterCount && (
          <p className="text-gray-400 text-xs" aria-live="polite">
            {characterCount}
          </p>
        )}
      </div>
    </div>
  );
};

const ImageField = ({
  imgFile,
  existingImg,
  imagePreview,
  fileInputRef,
  errors,
  onFileChange,
  onClear,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="img" className="block text-sm font-medium text-gray-700">
        Imagen de portada
        <span className="text-destructivo ml-1">*</span>
      </label>

      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          id="img"
          type="file"
          onChange={onFileChange}
          accept={FILE_CONFIG.ACCEPTED_TYPES}
          required={!existingImg}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primario file:text-white hover:file:bg-enfasis cursor-pointer"
        />
        {(imgFile || existingImg) && (
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
            aria-label="Eliminar imagen"
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="min-h-[1.25rem]">
          {errors.img && (
            <p
              id="img-error"
              className="text-red-500 text-sm flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {errors.img}
              {existingImg && !imgFile && (
                <span className="font-normal">
                  {" "}
                  Deja vacío para mantener la imagen actual.
                </span>
              )}
            </p>
          )}
        </div>
        <p className="text-gray-400 text-xs">
          (PNG, JPG, WebP). Máximo {FILE_CONFIG.MAX_SIZE_MB}MB.
        </p>
      </div>

      {imagePreview && (
        <div className="mt-3 border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="flex justify-center">
            <img
              src={imagePreview}
              alt="Vista previa de la portada"
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

const VideoLinkField = ({
  id,
  value,
  onChange,
  error,
  isLinkValid,
  isPreviewing,
  onPreview,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        URL del video (YouTube, Vimeo, etc.)
      </label>

      <div className="flex gap-2">
        <input
          id={id}
          type="url"
          value={value}
          onChange={onChange}
          placeholder="https://youtube.com/watch?v=..."
          maxLength={VALIDATION.MAX_LENGTH.link}
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primario transition-colors ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
        />

        <button
          type="button"
          onClick={onPreview}
          disabled={!value?.trim() || !isLinkValid || isPreviewing}
          className={`
            px-4 py-2 rounded-lg font-medium text-white transition-colors 
            flex items-center gap-2 min-w-[100px] justify-center
            ${
              isPreviewing
                ? "bg-blue-300 cursor-wait"
                : isLinkValid
                  ? "bg-primario hover:bg-enfasis cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
            focus:outline-none focus:ring-2 focus:ring-primario focus:ring-offset-2
          `}
          aria-label={
            isLinkValid
              ? "Previsualizar video en nueva pestaña"
              : "URL inválida"
          }
        >
          {isPreviewing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="hidden sm:inline">Abriendo...</span>
            </>
          ) : (
            <>
              <Video className="h-4 w-4" aria-hidden="true" />
              <span>Ver video</span>
            </>
          )}
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
        <p className="text-gray-400 text-xs">URL (http:// o https://)</p>
      </div>
    </div>
  );
};

export default ModalFormularioCurso;
