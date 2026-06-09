import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  Star,
  Package,
  Save,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// CONSTANTES - Configuración centralizada
// ─────────────────────────────────────────────────────────────
const VALIDATION = {
  MIN_LENGTH: {
    nombre: 3,
    descripcion: 100,
  },
  MAX_LENGTH: {
    nombre: 60,
    descripcion: 300,
  },
  PRECIO: {
    MIN: 0,
  },
  DESCUENTO: {
    MIN: 0,
    MAX: 100,
  },
};

const FILE_CONFIG = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_TYPES: "image/*",
};

const INITIAL_FORM_DATA = {
  nombre: "",
  descripcion: "",
  precio: "",
  descuento: "",
  tipo_usuario: "general",
  portafolio: "",
  destacado: false,
  activo: false,
};

const TIPO_USUARIO_OPTIONS = [
  { value: "general", label: "General" },
  { value: "profesional", label: "Profesional" },
];

// ─────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────
const parseNumber = (value, fallback = null) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
const ModalFormularioProducto = ({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  isCreating = true,
  isLoading = false,
  portafolios = [],
}) => {
  const fileInputRef = useRef(null);
  const modalContentRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [imgFile, setImgFile] = useState(null);
  const [existingImg, setExistingImg] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
      if (product && !isCreating) {
        loadProductData(product);
      } else {
        resetForm();
      }

      setErrors({});
      setIsClosing(false);

      // Focus management para accesibilidad
      setTimeout(() => {
        modalContentRef.current?.querySelector("input, select")?.focus();
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
  }, [isOpen, product, isCreating]);

  // ───────────────────────────────────────────────────────────
  // Cargar datos de producto existente
  // ───────────────────────────────────────────────────────────
  const loadProductData = useCallback((data) => {
    setFormData({
      nombre: data.nombre || "",
      descripcion: data.descripcion || "",
      precio: data.precio?.toString() ?? "",
      descuento: data.descuento?.toString() ?? "",
      tipo_usuario: data.tipo_usuario || "general",
      portafolio: data.portafolio?.id?.toString() ?? "",
      destacado: Boolean(data.destacado),
      activo: data.activo !== undefined ? Boolean(data.activo) : false,
    });

    setExistingImg(data.img || null);
    setImgFile(null);
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
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error(
        "Solo se permiten archivos de imagen (JPG, PNG, WebP, etc.)",
        {
          icon: "❌",
          duration: 3000,
        },
      );
      e.target.value = "";
      return;
    }

    // Validar tamaño
    if (file.size > FILE_CONFIG.MAX_SIZE_BYTES) {
      toast.error(
        `La imagen no debe superar los ${FILE_CONFIG.MAX_SIZE_MB}MB`,
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
      newErrors.img = "La imagen del producto es requerida";
    }

    // Validación de nombre
    const nombre = formData.nombre?.trim();
    if (!nombre) {
      newErrors.nombre = "El nombre es requerido";
    } else if (nombre.length < VALIDATION.MIN_LENGTH.nombre) {
      newErrors.nombre = `El nombre debe tener al menos ${VALIDATION.MIN_LENGTH.nombre} caracteres`;
    }

    // Validación de descripción
    const descripcion = formData.descripcion?.trim();
    if (!descripcion) {
      newErrors.descripcion = "La descripción es requerida";
    } else if (descripcion.length < VALIDATION.MIN_LENGTH.descripcion) {
      newErrors.descripcion = `La descripción debe tener al menos ${VALIDATION.MIN_LENGTH.descripcion} caracteres`;
    }

    // Validación de precio
    const precio = parseNumber(formData.precio);
    if (formData.precio === "" || precio === null) {
      newErrors.precio = "El precio es requerido";
    } else if (precio <= VALIDATION.PRECIO.MIN) {
      newErrors.precio = "El precio debe ser mayor a 0";
    }

    // Validación de descuento (opcional)
    if (formData.descuento?.trim()) {
      const descuento = parseNumber(formData.descuento);
      if (
        descuento === null ||
        descuento < VALIDATION.DESCUENTO.MIN ||
        descuento > VALIDATION.DESCUENTO.MAX
      ) {
        newErrors.descuento = `El descuento debe estar entre ${VALIDATION.DESCUENTO.MIN} y ${VALIDATION.DESCUENTO.MAX}%`;
      }
    }

    // Validación de portafolio
    if (!formData.portafolio) {
      newErrors.portafolio = "El portafolio es requerido";
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
      const precio = parseNumber(formData.precio, 0);
      const descuento = formData.descuento?.trim()
        ? parseNumber(formData.descuento, 0)
        : null;

      let payload;

      if (imgFile) {
        // Usar FormData cuando hay nuevo archivo
        payload = new FormData();
        payload.append("nombre", formData.nombre.trim());
        payload.append("descripcion", formData.descripcion.trim());
        payload.append("precio", precio);
        if (descuento !== null) {
          payload.append("descuento", descuento);
        }
        payload.append("tipo_usuario", formData.tipo_usuario);
        payload.append("portafolio", parseNumber(formData.portafolio, 0));
        payload.append("destacado", String(formData.destacado));
        payload.append("activo", String(formData.activo));
        payload.append("img", imgFile);
      } else {
        // Enviar JSON manteniendo imagen existente
        payload = {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          precio,
          descuento,
          tipo_usuario: formData.tipo_usuario,
          portafolio: parseNumber(formData.portafolio, 0),
          destacado: formData.destacado,
          activo: formData.activo,
        };
      }

      await onSubmit(payload);
    } catch (error) {
      console.error("Error al guardar producto:", error);

      // Normalizar mensaje de error
      const errorMsg = error?.response?.data;
      const errorMessage =
        typeof errorMsg === "string"
          ? errorMsg
          : errorMsg?.message ||
            error?.message ||
            "Error al guardar el producto";

      toast.error(`Error: ${errorMessage}`, {
        icon: "❌",
        duration: 4000,
      });
    }
  };

  // ───────────────────────────────────────────────────────────
  // Cálculo de precio con descuento (memoizado)
  // ───────────────────────────────────────────────────────────
  const precioConDescuento = useMemo(() => {
    const precio = parseNumber(formData.precio);
    const descuento = parseNumber(formData.descuento);

    if (
      precio === null ||
      descuento === null ||
      descuento <= VALIDATION.DESCUENTO.MIN ||
      descuento > VALIDATION.DESCUENTO.MAX
    ) {
      return precio;
    }

    return Math.round(precio - (precio * descuento) / 100);
  }, [formData.precio, formData.descuento]);

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

  const handleCheckboxChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.checked,
      }));
    },
    [],
  );

  const handleSelectChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    [],
  );

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
        aria-labelledby="product-modal-title"
      >
        {/* Modal Content */}
        <div
          ref={modalContentRef}
          className={`bg-bgSecundario rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] transform transition-all duration-300 ${
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
                <Package className="h-6 w-6 text-white" aria-hidden="true" />
              )}
              <h2
                id="product-modal-title"
                className="text-xl font-bold text-white"
              >
                {isCreating
                  ? "Crear nuevo producto"
                  : `Editar: ${product?.nombre || "Producto"}`}
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
              {/* Imagen del producto */}
              <ImageField
                imgFile={imgFile}
                existingImg={existingImg}
                imagePreview={imagePreview}
                fileInputRef={fileInputRef}
                errors={errors}
                onFileChange={handleFileChange}
                onClear={clearImage}
              />

              {/* Nombre y Descripción */}
              <div className="grid grid-cols-1 gap-4 pt-2">
                <FormField
                  id="nombre"
                  label="Nombre del producto"
                  value={formData.nombre}
                  onChange={handleInputChange("nombre")}
                  error={errors.nombre}
                  maxLength={VALIDATION.MAX_LENGTH.nombre}
                  required
                  placeholder="Nombre del producto"
                />
                <FormField
                  id="descripcion"
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={handleInputChange("descripcion")}
                  error={errors.descripcion}
                  maxLength={VALIDATION.MAX_LENGTH.descripcion}
                  minLength={VALIDATION.MIN_LENGTH.descripcion}
                  required
                  as="textarea"
                  rows={3}
                  placeholder="Descripción breve del producto..."
                />
              </div>

              {/* Precio, Descuento y Precio Final */}
              <PricingSection
                formData={formData}
                errors={errors}
                precioConDescuento={precioConDescuento}
                onPriceChange={handleInputChange("precio")}
                onDiscountChange={handleInputChange("descuento")}
              />

              {/* Tipo de usuario y Portafolio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label
                    htmlFor="tipo_usuario"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tipo de usuario
                    <span className="text-destructivo ml-1">*</span>
                  </label>
                  <select
                    id="tipo_usuario"
                    value={formData.tipo_usuario}
                    onChange={handleSelectChange("tipo_usuario")}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primario transition-colors ${
                      errors.tipo_usuario ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    aria-invalid={!!errors.tipo_usuario}
                  >
                    {TIPO_USUARIO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipo_usuario && (
                    <p
                      id="tipo-usuario-error"
                      className="text-red-500 text-sm flex items-center gap-1"
                      role="alert"
                    >
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      {errors.tipo_usuario}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Define quién puede ver este producto en la tienda
                  </p>
                </div>

                <PortafolioField
                  value={formData.portafolio}
                  onChange={handleSelectChange("portafolio")}
                  error={errors.portafolio}
                  portafolios={portafolios}
                />
              </div>

              {/* Opciones adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <ToggleField
                  id="destacado"
                  checked={formData.destacado}
                  onChange={handleCheckboxChange("destacado")}
                  label={
                    <span className="flex items-center gap-1">
                      <Star
                        className="h-4 w-4 text-amber-400 fill-amber-400"
                        aria-hidden="true"
                      />
                      Producto destacado
                    </span>
                  }
                  helperText="Los productos destacados son abiertos al público."
                />
                <ToggleField
                  id="activo"
                  checked={formData.activo}
                  onChange={handleCheckboxChange("activo")}
                  label="Producto activo (visible)"
                  helperText="Los productos inactivos no serán visibles para ningún usuario"
                />
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
                  {isCreating ? "Crear producto" : "Guardar cambios"}
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
      <label className="block text-sm font-medium text-gray-700">
        Imagen del producto
        <span className="text-destructivo ml-1">*</span>
      </label>

      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileChange}
            accept={FILE_CONFIG.ACCEPTED_TYPES}
            required={!existingImg}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primario file:text-white hover:file:bg-enfasis cursor-pointer"
            aria-label="Seleccionar imagen del producto"
          />
        </div>
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
          (JPG, PNG, WebP). Máximo {FILE_CONFIG.MAX_SIZE_MB}MB.
        </p>
      </div>

      {imagePreview && (
        <div className="mt-3 border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="flex justify-center">
            <img
              src={imagePreview}
              alt="Vista previa del producto"
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

const PricingSection = ({
  formData,
  errors,
  precioConDescuento,
  onPriceChange,
  onDiscountChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      {/* Precio */}
      <div className="space-y-2">
        <label
          htmlFor="precio"
          className="block text-sm font-medium text-gray-700"
        >
          Precio (COP)
          <span className="text-destructivo ml-1">*</span>
        </label>
        <input
          id="precio"
          type="number"
          value={formData.precio}
          onChange={onPriceChange}
          min={VALIDATION.PRECIO.MIN}
          step="100"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primario transition-colors ${
            errors.precio ? "border-red-500" : "border-gray-300"
          }`}
          required
          aria-invalid={!!errors.precio}
          aria-describedby={errors.precio ? "precio-error" : undefined}
          placeholder="0"
        />
        {errors.precio && (
          <p
            id="precio-error"
            className="text-red-500 text-sm flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {errors.precio}
          </p>
        )}
      </div>

      {/* Descuento */}
      <div className="space-y-2">
        <label
          htmlFor="descuento"
          className="block text-sm font-medium text-gray-700"
        >
          Descuento (%)
        </label>
        <div className="relative">
          <input
            id="descuento"
            type="number"
            value={formData.descuento}
            onChange={onDiscountChange}
            min={VALIDATION.DESCUENTO.MIN}
            max={VALIDATION.DESCUENTO.MAX}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primario transition-colors pl-8 ${
              errors.descuento ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={!!errors.descuento}
            aria-describedby={errors.descuento ? "descuento-error" : undefined}
            placeholder="0"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
            %
          </span>
        </div>
        {errors.descuento && (
          <p
            id="descuento-error"
            className="text-red-500 text-sm flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {errors.descuento}
          </p>
        )}
      </div>

      {/* Precio final */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Precio final (COP)
        </label>
        <input
          type="text"
          value={formatCurrency(precioConDescuento)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-primario font-semibold cursor-not-allowed"
          readOnly
          aria-label="Precio calculado con descuento aplicado"
        />
      </div>
    </div>
  );
};

const PortafolioField = ({ value, onChange, error, portafolios }) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="portafolio"
        className="block text-sm font-medium text-gray-700"
      >
        Portafolio
        <span className="text-destructivo ml-1">*</span>
      </label>
      <select
        id="portafolio"
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primario transition-colors ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        required
        aria-invalid={!!error}
        aria-describedby={error ? "portafolio-error" : undefined}
      >
        <option value="">Selecciona un portafolio</option>
        {portafolios.map((portafolio) => (
          <option key={portafolio.id} value={portafolio.id}>
            {portafolio.nombre}
          </option>
        ))}
      </select>
      {error && (
        <p
          id="portafolio-error"
          className="text-red-500 text-sm flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
};

const ToggleField = ({ id, checked, onChange, label, helperText }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="form-checkbox accent-primario h-5 w-5 rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </label>
      {helperText && <p className="text-xs text-gray-500 ml-8">{helperText}</p>}
    </div>
  );
};

export default ModalFormularioProducto;
