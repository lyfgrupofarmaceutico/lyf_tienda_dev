import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  FileText,
  Save,
  Plus,
  CheckCircle,
  AlertCircle,
  BriefcaseBusinessIcon,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// CONSTANTES - Configuración centralizada
// ─────────────────────────────────────────────────────────────
const VALIDATION = {
  MIN_LENGTH: {
    nombre: 3,
    ruta: 1,
    resumen: 40,
    titulo: 5,
    descripcion: 300,
  },
  MAX_LENGTH: {
    nombre: 30,
    ruta: 30,
    resumen: 80,
    titulo: 50,
    descripcion: 700,
  },
  RUTA_REGEX: /^[a-z][-a-z0-9]*$/,
};

const FILE_CONFIG = {
  LOGO: {
    MAX_SIZE_MB: 5,
    ACCEPTED_TYPES: "image/*",
  },
  BANNER: {
    MAX_SIZE_MB: 5,
    ACCEPTED_TYPES: "image/*",
  },
  PDF: {
    MAX_SIZE_MB: 30,
    ACCEPTED_TYPES: "application/pdf",
  },
};

const INITIAL_FORM_DATA = {
  nombre: "",
  ruta: "",
  resumen: "",
  titulo: "",
  descripcion: "",
  activo: true,
};

// ─────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
};

const extractFileName = (url) => {
  try {
    // Intentar usar URL API para mayor robustez
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || "archivo";
  } catch {
    // Fallback para URLs relativas o inválidas
    return url.split("/").pop() || "archivo";
  }
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
const ModalFormularioPortafolio = ({
  isOpen,
  onClose,
  onSubmit,
  portafolio = null,
  isCreating = true,
  isLoading = false,
}) => {
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const modalContentRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Archivos nuevos (File objects)
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // URLs de archivos existentes
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState(null);

  // Previews para UI
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
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
      if (portafolio && !isCreating) {
        loadPortafolioData(portafolio);
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
      const timer = setTimeout(() => {
        setIsClosing(false);
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, portafolio, isCreating]);

  // ───────────────────────────────────────────────────────────
  // Cargar datos de portafolio existente
  // ───────────────────────────────────────────────────────────
  const loadPortafolioData = useCallback((data) => {
    setFormData({
      nombre: data.nombre || "",
      ruta: data.ruta || "",
      resumen: data.resumen || "",
      titulo: data.titulo || "",
      descripcion: data.descripcion || "",
      activo: data.activo !== undefined ? Boolean(data.activo) : true,
    });

    // Archivos existentes
    setExistingLogoUrl(data.logo || null);
    setExistingBannerUrl(data.banner || null);
    setExistingPdfUrl(data.catalogo_pdf || null);

    // Previews
    setLogoPreview(data.logo || null);
    setBannerPreview(data.banner || null);

    if (data.catalogo_pdf) {
      setPdfInfo({
        name: extractFileName(data.catalogo_pdf),
        size: 0, // No conocemos el tamaño de archivos remotos
      });
    } else {
      setPdfInfo(null);
    }

    // Resetear archivos nuevos
    setLogoFile(null);
    setBannerFile(null);
    setPdfFile(null);
  }, []);

  // ───────────────────────────────────────────────────────────
  // Resetear formulario a estado inicial
  // ───────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData({ ...INITIAL_FORM_DATA });

    // Resetear archivos
    setLogoFile(null);
    setBannerFile(null);
    setPdfFile(null);
    setExistingLogoUrl(null);
    setExistingBannerUrl(null);
    setExistingPdfUrl(null);
    setLogoPreview(null);
    setBannerPreview(null);
    setPdfInfo(null);

    // Limpiar inputs de archivo
    [logoInputRef, bannerInputRef, pdfInputRef].forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
  }, []);

  // ───────────────────────────────────────────────────────────
  // Validación y configuración de archivo (centralizada)
  // ───────────────────────────────────────────────────────────
  const validateAndSetFile = useCallback((file, config, inputRef) => {
    if (!file) return false;

    // Validar tipo
    if (config.acceptedTypes === "image/*" && !file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen", {
        icon: "❌",
        duration: 3000,
      });
      if (inputRef?.current) inputRef.current.value = "";
      return false;
    }

    if (
      config.acceptedTypes === "application/pdf" &&
      file.type !== "application/pdf"
    ) {
      toast.error("Solo se permiten archivos PDF", {
        icon: "❌",
        duration: 3000,
      });
      if (inputRef?.current) inputRef.current.value = "";
      return false;
    }

    // Validar tamaño
    const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`El archivo no debe superar los ${config.maxSizeMB}MB`, {
        icon: "❌",
        duration: 3000,
      });
      if (inputRef?.current) inputRef.current.value = "";
      return false;
    }

    return true;
  }, []);

  // ───────────────────────────────────────────────────────────
  // Handlers de archivos con FileReader cleanup
  // ───────────────────────────────────────────────────────────
  const handleLogoChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file || !validateAndSetFile(file, FILE_CONFIG.LOGO, logoInputRef))
        return;

      setLogoFile(file);
      setExistingLogoUrl(null);

      // Generar preview con cleanup
      const reader = new FileReader();
      let isCancelled = false;

      reader.onload = (event) => {
        if (!isCancelled && event.target?.result) {
          setLogoPreview(event.target.result);
        }
      };

      reader.onerror = () => {
        toast.error("Error al leer el archivo", { icon: "❌", duration: 2000 });
      };

      reader.readAsDataURL(file);

      toast.success("Logo seleccionado correctamente", { duration: 2000 });

      return () => {
        isCancelled = true;
        reader.abort?.();
      };
    },
    [validateAndSetFile],
  );

  const handleBannerChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (
        !file ||
        !validateAndSetFile(file, FILE_CONFIG.BANNER, bannerInputRef)
      )
        return;

      setBannerFile(file);
      setExistingBannerUrl(null);

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

      toast.success("Banner seleccionado correctamente", { duration: 2000 });

      return () => {
        isCancelled = true;
        reader.abort?.();
      };
    },
    [validateAndSetFile],
  );

  const handlePdfChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file || !validateAndSetFile(file, FILE_CONFIG.PDF, pdfInputRef))
        return;

      setPdfFile(file);
      setExistingPdfUrl(null);
      setPdfInfo({ name: file.name, size: file.size });

      toast.success("PDF seleccionado correctamente", { duration: 2000 });
    },
    [validateAndSetFile],
  );

  // ───────────────────────────────────────────────────────────
  // Limpieza de archivos
  // ───────────────────────────────────────────────────────────
  const clearFile = useCallback(
    (type) => {
      const configs = {
        logo: {
          setFile: setLogoFile,
          setPreview: setLogoPreview,
          setExisting: setExistingLogoUrl,
          ref: logoInputRef,
          existingUrl: existingLogoUrl,
        },
        banner: {
          setFile: setBannerFile,
          setPreview: setBannerPreview,
          setExisting: setExistingBannerUrl,
          ref: bannerInputRef,
          existingUrl: existingBannerUrl,
        },
        pdf: {
          setFile: setPdfFile,
          setPreview: setPdfInfo,
          setExisting: setExistingPdfUrl,
          ref: pdfInputRef,
          existingUrl: existingPdfUrl,
        },
      };

      const config = configs[type];
      if (!config) return;

      config.setFile(null);
      config.setExisting(null);

      // En edición: restaurar preview del archivo existente si hay uno
      // En creación: limpiar completamente
      if (!isCreating && config.existingUrl) {
        if (type === "pdf") {
          config.setPreview({
            name: extractFileName(config.existingUrl),
            size: 0,
          });
        } else {
          config.setPreview(config.existingUrl);
        }
      } else {
        config.setPreview(null);
      }

      if (config.ref?.current) {
        config.ref.current.value = "";
      }
    },
    [isCreating, existingLogoUrl, existingBannerUrl, existingPdfUrl],
  );

  // ───────────────────────────────────────────────────────────
  // Validación del formulario
  // ───────────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Campos de texto
    const nombre = formData.nombre?.trim();
    if (!nombre || nombre.length < VALIDATION.MIN_LENGTH.nombre) {
      newErrors.nombre = `El nombre debe tener al menos ${VALIDATION.MIN_LENGTH.nombre} caracteres`;
    }

    const ruta = formData.ruta?.trim();
    if (!ruta || !VALIDATION.RUTA_REGEX.test(ruta)) {
      newErrors.ruta =
        "La ruta solo puede contener letras minúsculas, números y guiones";
    }

    const resumen = formData.resumen?.trim();
    if (!resumen || resumen.length < VALIDATION.MIN_LENGTH.resumen) {
      newErrors.resumen = `El resumen debe tener al menos ${VALIDATION.MIN_LENGTH.resumen} caracteres`;
    }

    const titulo = formData.titulo?.trim();
    if (!titulo || titulo.length < VALIDATION.MIN_LENGTH.titulo) {
      newErrors.titulo = `El título debe tener al menos ${VALIDATION.MIN_LENGTH.titulo} caracteres`;
    }

    const descripcion = formData.descripcion?.trim();
    if (
      !descripcion ||
      descripcion.length < VALIDATION.MIN_LENGTH.descripcion
    ) {
      newErrors.descripcion = `La descripción debe tener al menos ${VALIDATION.MIN_LENGTH.descripcion} caracteres`;
    }

    // Validación de archivos (requeridos al crear, opcionales en edición si ya existen)
    if (!logoFile && !existingLogoUrl) {
      newErrors.logo = "El logo es requerido";
    }
    if (!bannerFile && !existingBannerUrl) {
      newErrors.banner = "El banner es requerido";
    }

    // Validación de tamaño para archivos nuevos (doble check de seguridad)
    if (
      logoFile &&
      logoFile.size > FILE_CONFIG.LOGO.MAX_SIZE_MB * 1024 * 1024
    ) {
      newErrors.logo = `El logo no debe superar los ${FILE_CONFIG.LOGO.MAX_SIZE_MB}MB`;
    }
    if (
      bannerFile &&
      bannerFile.size > FILE_CONFIG.BANNER.MAX_SIZE_MB * 1024 * 1024
    ) {
      newErrors.banner = `El banner no debe superar los ${FILE_CONFIG.BANNER.MAX_SIZE_MB}MB`;
    }
    if (pdfFile && pdfFile.size > FILE_CONFIG.PDF.MAX_SIZE_MB * 1024 * 1024) {
      newErrors.catalogo_pdf = `El PDF no debe superar los ${FILE_CONFIG.PDF.MAX_SIZE_MB}MB`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    formData,
    logoFile,
    bannerFile,
    pdfFile,
    existingLogoUrl,
    existingBannerUrl,
  ]);

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
      const hasNewFiles = logoFile || bannerFile || pdfFile;

      if (hasNewFiles) {
        // Enviar con FormData si hay archivos nuevos
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            // Convertir booleanos a string para consistencia con backend
            data.append(
              key,
              typeof value === "boolean" ? String(value) : value,
            );
          }
        });
        if (logoFile) data.append("logo", logoFile);
        if (bannerFile) data.append("banner", bannerFile);
        if (pdfFile) data.append("catalogo_pdf", pdfFile);

        await onSubmit(data);
      } else {
        // Enviar solo texto si no hay archivos nuevos
        await onSubmit({
          ...formData,
          activo: Boolean(formData.activo),
        });
      }
    } catch (error) {
      console.error("Error al guardar portafolio:", error);

      // Normalizar mensaje de error
      const errorMsg = error?.response?.data;
      const errorMessage =
        typeof errorMsg === "string"
          ? errorMsg
          : errorMsg?.message ||
            error?.message ||
            "Error al guardar el portafolio";

      toast.error(`Error: ${errorMessage}`, {
        icon: "❌",
        duration: 4000,
      });
    }
  };

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
        aria-labelledby="portafolio-modal-title"
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
                <BriefcaseBusinessIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              )}
              <h2
                id="portafolio-modal-title"
                className="text-xl font-bold text-white"
              >
                {isCreating
                  ? "Crear nuevo portafolio"
                  : `Editar: ${portafolio?.nombre || "Portafolio"}`}
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
              {/* Nombre y Ruta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="nombre"
                  label="Nombre del portafolio"
                  value={formData.nombre}
                  onChange={handleInputChange("nombre")}
                  error={errors.nombre}
                  maxLength={VALIDATION.MAX_LENGTH.nombre}
                  required
                  placeholder="Nombre del portafolio"
                />

                <div className="space-y-2">
                  <label
                    htmlFor="ruta"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ruta (URL)
                    <span className="text-destructivo ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                      /portafolio/
                    </span>
                    <input
                      id="ruta"
                      type="text"
                      value={formData.ruta}
                      onChange={handleInputChange("ruta")}
                      maxLength={VALIDATION.MAX_LENGTH.ruta}
                      className={`w-full pl-24 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primario transition-colors ${
                        errors.ruta ? "border-red-500" : "border-gray-300"
                      }`}
                      aria-invalid={!!errors.ruta}
                      aria-describedby={errors.ruta ? "ruta-error" : undefined}
                      autoComplete="off"
                      required
                      placeholder="mi-portafolio"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="min-h-[1.25rem]">
                      {errors.ruta && (
                        <p
                          id="ruta-error"
                          className="text-red-500 text-sm flex items-center gap-1"
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4" aria-hidden="true" />
                          {errors.ruta}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs" aria-live="polite">
                      {formData.ruta.length}/{VALIDATION.MAX_LENGTH.ruta}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen y Título */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="resumen"
                  label="Resumen"
                  value={formData.resumen}
                  onChange={handleInputChange("resumen")}
                  error={errors.resumen}
                  maxLength={VALIDATION.MAX_LENGTH.resumen}
                  minLength={VALIDATION.MIN_LENGTH.resumen}
                  required
                  placeholder="Breve resumen del portafolio"
                />
                <FormField
                  id="titulo"
                  label="Título del portafolio"
                  value={formData.titulo}
                  onChange={handleInputChange("titulo")}
                  error={errors.titulo}
                  maxLength={VALIDATION.MAX_LENGTH.titulo}
                  minLength={VALIDATION.MIN_LENGTH.titulo}
                  required
                  placeholder="Título del portafolio"
                />
              </div>

              {/* Descripción */}
              <FormField
                id="descripcion"
                label="Descripción del portafolio"
                value={formData.descripcion}
                onChange={handleInputChange("descripcion")}
                error={errors.descripcion}
                maxLength={VALIDATION.MAX_LENGTH.descripcion}
                minLength={VALIDATION.MIN_LENGTH.descripcion}
                required
                as="textarea"
                rows={3}
                placeholder="Descripción acerca del portafolio..."
              />

              {/* Logo */}
              <FileField
                label="Logo del portafolio"
                file={logoFile}
                existingUrl={existingLogoUrl}
                preview={logoPreview}
                inputRef={logoInputRef}
                error={errors.logo}
                config={FILE_CONFIG.LOGO}
                isImage={true}
                isCreating={isCreating}
                onFileChange={handleLogoChange}
                onClear={() => clearFile("logo")}
              />

              {/* Banner */}
              <FileField
                label="Banner del portafolio"
                file={bannerFile}
                existingUrl={existingBannerUrl}
                preview={bannerPreview}
                inputRef={bannerInputRef}
                error={errors.banner}
                config={FILE_CONFIG.BANNER}
                isImage={true}
                isCreating={isCreating}
                onFileChange={handleBannerChange}
                onClear={() => clearFile("banner")}
              />

              {/* PDF Catálogo */}
              <PdfField
                file={pdfFile}
                existingUrl={existingPdfUrl}
                pdfInfo={pdfInfo}
                inputRef={pdfInputRef}
                error={errors.catalogo_pdf}
                config={FILE_CONFIG.PDF}
                isCreating={isCreating}
                onFileChange={handlePdfChange}
                onClear={() => clearFile("pdf")}
              />

              {/* Estado activo */}
              <div className="space-y-2 py-4 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={handleCheckboxChange}
                    className="form-checkbox accent-primario h-5 w-5 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Portafolio activo (visible en la tienda)
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-8">
                  Los portafolios inactivos no serán visibles para los usuarios
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
                  {isCreating ? "Crear portafolio" : "Guardar cambios"}
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

const FileField = ({
  label,
  file,
  existingUrl,
  preview,
  inputRef,
  error,
  config,
  isImage,
  isCreating,
  onFileChange,
  onClear,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-destructivo ml-1">*</span>
      </label>

      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            onChange={onFileChange}
            accept={config.acceptedTypes}
            required={!existingUrl}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primario file:text-white hover:file:bg-enfasis cursor-pointer"
            aria-label={`Seleccionar ${label.toLowerCase()}`}
          />
        </div>
        {(file || preview) && (
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
            aria-label={`Eliminar ${label.toLowerCase()}`}
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="min-h-[1.25rem]">
          {error && (
            <p
              className="text-red-500 text-sm flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {error}
              {existingUrl && !file && (
                <span className="font-normal">
                  {" "}
                  Deja vacío para mantener el actual.
                </span>
              )}
            </p>
          )}
        </div>
        <p className="text-gray-400 text-xs">
          {isImage ? "(PNG, JPG, WebP)" : "(PDF)"}. Máx. {config.maxSizeMB}MB.
        </p>
      </div>

      {preview && isImage && (
        <div className="mt-2 border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="flex justify-center">
            <img
              src={preview}
              alt={`Vista previa de ${label.toLowerCase()}`}
              className="max-h-24 w-auto object-contain rounded"
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

const PdfField = ({
  file,
  existingUrl,
  pdfInfo,
  inputRef,
  error,
  config,
  isCreating,
  onFileChange,
  onClear,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Catálogo PDF (opcional)
      </label>

      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            onChange={onFileChange}
            accept={config.acceptedTypes}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primario file:text-white hover:file:bg-enfasis cursor-pointer"
            aria-label="Seleccionar catálogo PDF"
          />
        </div>
        {file && (
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
            aria-label="Eliminar PDF"
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="min-h-[1.25rem]">
          {error && (
            <p
              className="text-red-500 text-sm flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {error}
              {existingUrl && !file && (
                <span className="font-normal">
                  {" "}
                  Deja vacío para mantener el actual.
                </span>
              )}
            </p>
          )}
        </div>
        <p className="text-gray-400 text-xs">PDF. Máx. {config.maxSizeMB}MB.</p>
      </div>

      {/* Info del PDF */}
      {pdfInfo && (
        <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FileText
              className="h-5 w-5 text-blue-600 flex-shrink-0"
              aria-hidden="true"
            />
            {existingUrl && !file ? (
              <a
                href={existingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-800 hover:underline truncate"
              >
                {pdfInfo.name}
              </a>
            ) : (
              <span className="text-sm font-medium text-blue-800 truncate">
                {pdfInfo.name}
              </span>
            )}
            {pdfInfo.size > 0 && (
              <span className="text-xs text-blue-600 flex-shrink-0">
                ({formatFileSize(pdfInfo.size)})
              </span>
            )}
          </div>
          <CheckCircle
            className="h-5 w-5 text-blue-600 flex-shrink-0"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default ModalFormularioPortafolio;
