import { useEffect, useMemo, useRef, useState } from "react";
import { useProductosLanding } from "@src/hooks/useProductosLanding";
import { useContactoLanding } from "@src/hooks/useContactoLanding";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import HeroCarousel from "@landing/components/HeroCarousel";
import CategoryCard from "@landing/components/CategoryCard";
import ProductCard from "@landing/components/ProductCard";
import {
  Package,
  Handshake,
  Truck,
  GraduationCap,
  Phone,
  MapPin,
  Mail,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Imagenes categorias
import medicinaEstetica from "@assets/categorias/medicina-estetica.webp";
import medicinaBiologica from "@assets/categorias/medicina-biologica.webp";
import medicinaOrtomolecular from "@assets/categorias/medicina-ortomolecular.webp";

// Banner productos
import banner_productos from "@assets/banners/banner-productos.webp";

// Imagenes LyF
import banner_lyf_asesores from "@assets/lyf/banner-lyf-asesores.webp";
import logo_lyf_asesores from "@assets/lyf/logo-lyf-asesores.webp";
import equipolyf from "@src/assets/team/team1.webp";

const categorias = [
  {
    titulo: "Medicina estética",
    img: medicinaEstetica,
  },
  {
    titulo: "Medicina biológica",
    img: medicinaBiologica,
  },
  {
    titulo: "Medicina ortomolecular",
    img: medicinaOrtomolecular,
  },
];

const servicios = [
  {
    icon: Package,
    titulo: "Línea de productos",
    descripcion:
      "Medicina estética, biológica y ortomolecular, garantizando calidad y respaldo.",
  },
  {
    icon: Handshake,
    titulo: "Aliados",
    descripcion: "Contamos con el portafolio de marcas de la más alta calidad.",
  },
  {
    icon: Truck,
    titulo: "Envíos",
    descripcion:
      "Domicilios en Popayán y envío a nivel nacional e internacional.",
  },
  {
    icon: GraduationCap,
    titulo: "Plataforma Educativa",
    descripcion:
      "Conferencias educativas para aportar a tu desarrollo profesional.",
  },
];

const Home = () => {
  const { data: productos, isLoading, error } = useProductosLanding();
  const { mutate, isPending } = useContactoLanding();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    city: "",
    email: "",
    reason: "",
    message: "",
  });

  // Estado para el boton
  const botonRef = useRef(null);
  const contenedorRef = useRef(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Estado local para el skeleton
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Validar si 'productos' es un arreglo real
  const esArregloValido = Array.isArray(productos);

  // Lógica calculada usando useMemo (Evita renders infinitos)
  const { productosMostrar, mostrarBanner } = useMemo(() => {
    if (isLoading || error || !esArregloValido || productos.length === 0) {
      return { productosMostrar: [], mostrarBanner: true };
    }
    return { productosMostrar: productos, mostrarBanner: false };
  }, [productos, isLoading, error, esArregloValido]);

  // Manejo controlado del log de errores en un useEffect legítimo
  useEffect(() => {
    if (error) {
      console.warn("Error al cargar productos destacados:", error);
    }
  }, [error]);

  // Ocultar skeleton con temporizador seguro
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSkeleton(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const productosVisibles = mostrarTodos
    ? productosMostrar
    : productosMostrar?.slice(0, 8) || [];

  const manejarMostrarTodos = () => {
    // Guardamos el estado anterior de forma segura
    const seVaAExpandir = !mostrarTodos;
    setMostrarTodos(seVaAExpandir);

    if (seVaAExpandir) {
      // ACCIÓN: VER MÁS
      setTimeout(() => {
        if (botonRef.current) {
          // Obtenemos la posición absoluta del botón en la página
          const posicionBoton =
            botonRef.current.getBoundingClientRect().top + window.scrollY;

          // Hacemos scroll hasta la posicion del boton + 50px extra hacia abajo
          window.scrollTo({
            top: posicionBoton - window.innerHeight + 150,
            behavior: "smooth",
          });
        }

        // Mantenemos el foco del teclado
        botonRef.current?.focus({ preventScroll: true });
      }, 150);
    } else {
      // ACCIÓN: VER MENOS
      // Obtenemos la posicion absoluta de la sección de productos
      const posicionContenedor =
        contenedorRef.current.getBoundingClientRect().top + window.scrollY;

      // Llevamos al usuario al inicio de la lista de productos
      window.scrollTo({
        top: posicionContenedor - 50,
        behavior: "smooth",
      });

      // Mantenemos el foco en el boton para que nunca se pierda
      setTimeout(() => {
        botonRef.current?.focus({ preventScroll: true });
      }, 150);
    }
  };

  // Skeleton UI para productos
  const renderSkeletonProductos = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-10 ">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="bg-bgSecundario border-2 border-gray-300 rounded-md overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-gray-300"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // Deshabilita inputs visualmente
    setIsSubmitting(true);

    mutate(formData, {
      onSuccess: (data) => {
        toast.success("¡Gracias por contactarnos!", {
          icon: "✅",
          duration: 5000,
          position: "top-right",
        });

        // Resetear formulario
        setFormData({
          fullname: "",
          phone: "",
          city: "",
          email: "",
          reason: "",
          message: "",
        });
      },

      onError: (error) => {
        const status = error.response?.status;
        const data = error.response?.data;

        // Manejo de errores según HTTP status
        switch (status) {
          // Validación fallida
          case 400:
            if (data?.details) {
              // Mostrar primer error de validación encontrado
              const firstError = Object.values(data.details)[0]?.[0];
              toast.error(
                `${firstError || "Verifica los campos del formulario"}`,
                {
                  icon: "⚠️",
                  duration: 4000,
                },
              );
            } else {
              toast.error(
                `${data?.error || "Verifica los datos del formulario"}`,
                {
                  icon: "⚠️",
                  duration: 4000,
                },
              );
            }
            break;

          // Rate limit
          case 429:
            const retryAfter = error.response?.headers?.["retry-after"];
            toast.error(
              `Demasiados intentos. ${retryAfter ? `Espera ${retryAfter}s` : "Intenta en unos minutos"}.`,
              {
                icon: "🕐",
                duration: 6000,
              },
            );
            break;

          // Error SMTP / servicio externo
          case 502:
          // Error interno
          case 500:
            toast.error("Estamos teniendo problemas técnicos.", {
              icon: "🔧",
              duration: 7000,
            });
            break;

          default:
            // Error de red o sin respuesta
            if (!error.response) {
              toast.error(
                "Sin conexión. Verifica tu internet e intenta nuevamente.",
                {
                  icon: "🌐",
                  duration: 5000,
                },
              );
            } else {
              toast.error("Error al enviar. Intenta nuevamente.", {
                icon: "❌",
                duration: 4000,
              });
            }
        }
      },

      onSettled: () => {
        // Siempre re-habilitar, sin importar el resultado
        setIsSubmitting(false);
      },
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow">
        {/* Seccion - Hero Carrusel */}
        <HeroCarousel />

        {/* Seccion - Servicios */}
        <section className="py-10 bg-bgPrimario">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {servicios.map((servicio, index) => (
                <div key={index} className="text-center">
                  <div className="text-primario rounded-full border-2 border-gray-300 inline-flex items-center justify-center p-6 mb-2">
                    <servicio.icon className="size-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{servicio.titulo}</h3>
                  <p className="text-sm text-txtNegro">
                    {servicio.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seccion - Tu aliado estratégico */}
        <section className="py-10">
          <div className="container mx-auto px-4 md:px-8">
            <div className="w-full md:max-w-4xl mx-auto text-center pb-10">
              <div className="inline-block px-8">
                <h2 className="text-primario text-3xl md:text-4xl font-bold pb-6">
                  ¡Tu aliado estratégico en salud y belleza!
                </h2>
              </div>
              <p className="text-lg">
                Distribuidor de productos para tratamientos estéticos de alta
                calidad. Insumos para sueroterapia, terapias integrativas y
                moleculares. Tienda de productos naturistas.
              </p>
            </div>

            {/* categorias Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map((categoria, index) => (
                <CategoryCard key={index} {...categoria} />
              ))}
            </div>
          </div>
        </section>

        {/* Seccion - Linea de productos */}
        <section
          className="relative py-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${banner_productos})`,
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 container mx-auto px-4 md:px-8 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-txtBlanco text-3xl md:text-4xl font-bold mb-4">
                Línea de productos
              </h2>
              <p className="text-txtBlanco text-lg max-w-3xl mx-auto">
                Nuestros portafolios están enfocados a los profesionales
                especializados en medicina biológica, estética y ortomolecular,
                garantizando calidad y respaldo.
              </p>
              <Link to="/auth">
                <button className="bg-primario hover:bg-secundario text-txtBlanco font-bold text-base md:text-lg px-6 py-2 rounded-md shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95 mt-6 mb-2">
                  Ir a la tienda
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Seccion - Productos destacados */}
        <section className="pt-10 pb-5 bg-bgSecundario">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h1 className="text-primario text-3xl md:text-4xl font-bold">
                Productos destacados
              </h1>
              <p className="text-2xl md:text-3xl text-textBlack">
                ¡Todo lo que necesitas en un solo lugar!
              </p>
            </div>

            {/* BANNER - Solo cuando NO hay productos reales */}
            {!showSkeleton && mostrarBanner && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-bgPrimario rounded-md p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="md:w-1/2">
                      <div className="flex items-center gap-3 mb-5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-primario"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <h3 className="text-2xl font-bold text-primario">
                          ¿Por qué nuestros productos?
                        </h3>
                      </div>
                      <p className="text-lg leading-relaxed">
                        Trabajamos exclusivamente con marcas certificadas que
                        cumplen con los más altos estándares de calidad,
                        trazabilidad y respaldo científico. Nuestros productos
                        están formulados específicamente para profesionales
                        especializados en tratamientos estéticos y terapias
                        integrativas.
                      </p>

                      {/* CTA estratégico dentro del banner */}
                      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                          to="/auth/login"
                          className="bg-primario hover:bg-secundario text-txtBlanco font-bold text-base md:text-lg px-6 py-2 rounded-md shadow-lg transition-all duration-300 flex flex-col items-center gap-2 transform hover:scale-105 active:scale-95 whitespace-nowrap"
                          aria-label="Iniciar sesión para acceder a productos profesionales"
                        >
                          Iniciar sesión
                        </Link>
                        <Link
                          to="/auth/register"
                          className="bg-bgPrimario text-primario border-2 border-primario font-bold text-base md:text-lg px-6 py-2 rounded-md shadow-lg transition-all duration-300 flex flex-col items-center gap-2 transform hover:scale-105 active:scale-95 whitespace-nowrap"
                          aria-label="Crear cuenta profesional gratuita"
                        >
                          Crear cuenta
                        </Link>
                      </div>
                    </div>

                    {/* Imagen decorativa del equipo (mejor UX que texto plano) */}
                    <div className="md:w-1/2">
                      <div className="relative">
                        <div className="absolute -inset-4 bg-primario/10 rounded-md blur-2xl" />
                        <img
                          src={equipolyf}
                          alt="Equipo profesional de L&F Grupo Farmacéutico"
                          className="relative rounded-md h-64 object-cover border-4 border-white"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badge de error (solo si hay error real) */}
                  <div className="mt-6 p-3 bg-blue-100 rounded-md text-center">
                    <div className="flex items-center justify-center gap-2 text-primario text-sm">
                      <AlertCircle
                        className="h-4 w-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        Explora nuestros catálogos completos creando una cuenta
                        e iniciando sesión.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GRID DE PRODUCTOS - Solo cuando hay productos reales */}
            {showSkeleton ? (
              <div className="max-w-6xl mx-auto mb-10">
                {renderSkeletonProductos()}
              </div>
            ) : (
              <div ref={contenedorRef}>
                {/* Muestra la cuadrícula de productos de forma segura */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
                  {Array.isArray(productosVisibles) &&
                    productosVisibles.map((producto, index) => (
                      <ProductCard key={producto.id || index} {...producto} />
                    ))}
                </div>

                {!error && productosMostrar.length > 8 && (
                  <div className="flex w-full justify-center mb-10">
                    {/* Enlace semántico estilizado como botón externo */}
                    <Link
                      ref={botonRef}
                      onClick={manejarMostrarTodos}
                      className="bg-primario hover:bg-secundario text-txtBlanco font-bold text-base md:text-lg px-6 py-2 rounded-md shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95"
                      aria-expanded={mostrarTodos}
                    >
                      {mostrarTodos ? "Ver menos" : "Ver todos"}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Seccion - LyF */}
        <section
          className="relative h-[400px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${banner_lyf_asesores})`,
          }}
        >
          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Contenido centrado */}
          <div className="relative z-10 container mx-auto px-4 md:px-8 h-full flex flex-col items-center justify-center text-center text-txtBlanco">
            <div className="flex flex-col items-center">
              {/* Logo LyF Asesores */}
              <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full p-4">
                <img
                  src={logo_lyf_asesores}
                  alt="LyF Asesores Logo"
                  className="h-40 w-40 sm:h-52 sm:w-52 object-contain"
                />
              </div>

              {/* Boton */}
              <Link
                to="https://www.facebook.com/lyf.contabilidad"
                target="_blank"
              >
                <button className="bg-primario hover:bg-secundario text-txtBlanco font-bold text-base md:text-lg px-6 py-2 rounded-md shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95 mt-6">
                  Información
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Seccion - Contactenos */}
        <section className="relative py-10">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-primario text-3xl md:text-4xl font-bold">
                Contáctenos
              </h1>
              <p className="text-2xl md:text-3xl text-textBlack">
                ¡Brindaremos respuesta en breve!
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-16">
              {/* Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre completo{" "}
                      <span className="text-destructivo">*</span>
                    </label>
                    <input
                      id="fullname"
                      name="fullname"
                      type="text"
                      value={formData.fullname}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || isPending}
                      autoComplete="off"
                      className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      maxLength={150}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Teléfono <span className="text-destructivo">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || isPending}
                      autoComplete="off"
                      className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ciudad <span className="text-destructivo">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || isPending}
                      autoComplete="off"
                      className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Correo electrónico{" "}
                      <span className="text-destructivo">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || isPending}
                      autoComplete="off"
                      className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      maxLength={250}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Motivo <span className="text-destructivo">*</span>
                    </label>
                    <input
                      id="reason"
                      name="reason"
                      type="text"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || isPending}
                      autoComplete="off"
                      className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mensaje <span className="text-destructivo">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      type="text"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || isPending}
                      autoComplete="off"
                      rows={5}
                      className="flex w-full rounded-md px-3 py-1.5 file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                      maxLength={2000}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || isSubmitting}
                    className={`bg-primario text-txtBlanco font-bold text-base md:text-lg px-6 py-2 rounded-md shadow-lg transition-all duration-300 flex items-center gap-2 mt-6 mb-2 ${
                      isPending
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-secundario hover:scale-105 active:scale-95 transform"
                    }
  `}
                  >
                    {isPending ? "Enviando..." : "Enviar"}
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="lg:col-span-2 bg-bgPrimario rounded-md p-5 lg:p-10">
                <h3 className="text-2xl font-bold text-primario mb-6">
                  L&F Grupo Farmacéutico
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start gap-3 mb-2">
                      <MapPin className="text-primario h-4 w-4 sm:h-6 sm:w-6 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">
                          Cra. 6A # 5N-17 Centro Comercial "La Casona", Segundo
                          Piso LOCAL 128, Popayán, Cauca.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <Phone className="text-primario h-4 w-4 sm:h-6 sm:w-6" />
                      <div>
                        <p className="font-semibold">
                          3182825718 <br />
                          3147542324
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <FaWhatsapp className="text-primario h-4 w-4 sm:h-6 sm:w-6" />
                      <div>
                        <p className="font-semibold">+57 3182825718</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <Mail className="text-primario h-4 w-4 sm:h-6 sm:w-6" />
                      <div className="min-w-0">
                        <p className="font-semibold break-all sm:break-words">
                          ventas.grupofarmaceutico@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mapa */}
                <div className="flex pt-10">
                  <div className="h-full w-full">
                    <iframe
                      className="aspect-video rounded-md"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7972.356526877779!2d-76.6042938!3d2.4476436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3003b0f7e9023f%3A0x94165d52dc7d55cb!2sL%26F%20Grupo%20Farmac%C3%A9utico!5e0!3m2!1ses-419!2sco!4v1781730166547!5m2!1ses-419!2sco"
                      loading="eager"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
