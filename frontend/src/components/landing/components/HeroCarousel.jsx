import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePromocionesLanding } from "@src/hooks/usePromocionesLanding";
import {
  ChevronLeft,
  ChevronRight,
  Dna,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import equipolyf from "@src/assets/banners/banner-hero.webp";

// CONTENIDO POR DEFECTO
const PROMOCIONES_DEFAULT = [
  {
    id: "default-1",
    banner: equipolyf,
    titulo: "Productos Profesionales",
    subtitulo: "Calidad Certificada",
    descripcion:
      "Descubre nuestros catálogos de productos para la medicina estética, biológica y ortomolecular.",
    texto_boton: "Ir a la tienda",
    link: "/dashboard",
    activo: true,
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const {
    data: promociones = [],
    isLoading,
    refetch,
    isRefetching,
    error,
  } = usePromocionesLanding();

  // Determinar qué promociones mostrar
  const hayDatosReales = Array.isArray(promociones) && promociones.length > 0;
  const promocionesMostrar = hayDatosReales ? promociones : PROMOCIONES_DEFAULT;

  // Log de errores para debug
  useEffect(() => {
    if (error) {
      console.warn("Promociones dio error", error);
    }
  }, [error]);

  // Auto-avance cada 6 segundos (solo si hay promociones)
  useEffect(() => {
    if (promocionesMostrar.length === 0 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promocionesMostrar.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [promocionesMostrar.length, isPaused]);

  // Callbacks optimizados
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    setIsPaused(true);

    // Reanudar después de 10 segundos de inactividad
    const resumeTimer = setTimeout(() => setIsPaused(false), 10000);
    return () => clearTimeout(resumeTimer);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % promocionesMostrar.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, [promocionesMostrar.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + promocionesMostrar.length) % promocionesMostrar.length,
    );
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, [promocionesMostrar.length]);

  // Skeleton UI durante carga
  if (isLoading && promociones.length === 0) {
    return (
      <div
        className="relative h-[500px] md:h-[600px] overflow-hidden bg-gray-900"
        aria-label="Cargando promociones"
        aria-busy="true"
      >
        {/* Fondo base del skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c5c9c] via-[#2d89c8] to-[#6ad0ec] animate-pulse" />

        <div className="absolute inset-0 flex items-center justify-center">
          <Dna className="h-10 w-10 text-txtBlanco animate-bounce" />
        </div>

        {/* Overlay de degradado */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/10 z-10" />

        {/* Contenido del Slide */}
        <div className="absolute inset-0 z-20">
          <div className="absolute px-4 md:px-8 inset-0 container mx-auto flex items-center">
            <div className="max-w-2xl z-10 space-y-6">
              {/* Título */}
              <div className="h-12 md:h-16 lg:h-20 w-3/4 bg-white/20 rounded-lg animate-pulse" />

              {/* Subtítulo */}
              <div className="h-10 md:h-14 lg:h-16 w-1/2 bg-white/10 rounded-lg animate-pulse" />

              {/* Descripción*/}
              <div className="space-y-3 max-w-xl pt-2">
                <div className="h-5 w-full bg-white/20 rounded animate-pulse" />
              </div>

              {/* Botón */}
              <div className="pt-4">
                <div className="h-12 md:h-14 w-48 md:w-56 bg-white/20 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Controles de navegación*/}
        <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
          <div className="h-12 w-12 md:h-14 md:w-14 bg-white/20 rounded-full animate-pulse" />
        </div>
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
          <div className="h-12 w-12 md:h-14 md:w-14 bg-white/20 rounded-full animate-pulse" />
        </div>

        {/* Indicadores (Puntos) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          <div className="h-2.5 w-10 bg-white/30 rounded-full animate-pulse" />
          <div className="h-2.5 w-2.5 bg-white/20 rounded-full animate-pulse" />
          <div className="h-2.5 w-2.5 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-[500px] md:h-[600px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Carrusel de promociones"
      role="region"
    >
      {/* Boton para actualizacion manual */}
      {hayDatosReales && (
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="absolute top-4 left-4 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full transition-all disabled:opacity-50 group"
          aria-label="Actualizar promociones"
          title="Actualizar"
        >
          <RefreshCw
            className={`h-5 w-5 text-txtBlanco hover:animate-spin transition-colors ${
              isRefetching ? "animate-spin" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      )}

      {/* Slides con transiciones CSS nativas */}
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out">
        {promocionesMostrar.map((promocion, index) => (
          <div
            key={promocion.id || index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={index !== currentSlide}
            role="tabpanel"
            id={`slide-${index}`}
            aria-labelledby={`tab-${index}`}
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/15 via-black/10 to-black/5 overflow-hidden" />

            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out"
              style={{
                backgroundImage: `url(${promocion.banner || PROMOCIONES_DEFAULT[0].banner})`,
                backgroundPosition: "center 30%",
                transform: index === currentSlide ? "scale(1.05)" : "scale(1)",
              }}
              aria-hidden="true"
            />

            <div className="absolute px-4 md:px-8 inset-0 container mx-auto flex items-center">
              <div
                className={`max-w-2xl text-txtBlanco z-10 transform transition-all duration-700 ease-out ${
                  index === currentSlide
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
                }`}
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                  {promocion.titulo || "Productos Profesionales"}
                </h1>

                <div className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-destacado leading-tight">
                  {promocion.subtitulo || "Calidad Certificada"}
                </div>

                <p className="text-lg font-medium md:text-xl mb-8 max-w-xl leading-relaxed">
                  {promocion.descripcion ||
                    "Descubre nuestros catálogos de productos para la medicina estética, biológica y ortomolecular."}
                </p>

                {promocion.link && (
                  <Link
                    to={promocion.link}
                    className="inline-block"
                    target="__blanck"
                    rel="noopener noreferrer"
                    onClick={() => setIsPaused(true)}
                  >
                    <button
                      className="bg-destacado hover:bg-destacado text-txtNegro font-bold text-base md:text-xl px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95"
                      aria-label={`Ir a ${promocion.texto_boton || "Ir a la tienda"}`}
                    >
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                      {promocion.texto_boton || "Ir a la tienda"}
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Overlay de degradado para texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-black/10 to-black/5 overflow-hidden" />
      {/* Controles de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all duration-300 z-20"
        aria-label="Promoción anterior"
        aria-controls="carousel"
      >
        <ChevronLeft
          className="h-6 w-6 md:h-8 md:w-8 text-txtBlanco"
          aria-hidden="true"
        />
      </button>
      {/* Controles de navegación */}
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all duration-300 z-20"
        aria-label="Siguiente promoción"
        aria-controls="carousel"
      >
        <ChevronRight
          className="h-6 w-6 md:h-8 md:w-8 text-txtBlanco"
          aria-hidden="true"
        />
      </button>
      {/* Indicadores de slide */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20"
        role="tablist"
        aria-label="Navegación de promociones"
      >
        {promocionesMostrar.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-10 bg-destacado"
                : "w-2.5 bg-white/50 hover:bg-white/75"
            }`}
            role="tab"
            aria-selected={index === currentSlide}
            aria-controls={`slide-${index}`}
            aria-label={`Ir a promoción ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
