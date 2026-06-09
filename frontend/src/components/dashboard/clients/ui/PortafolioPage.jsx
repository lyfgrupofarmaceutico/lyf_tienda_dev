import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePortafolioRuta } from "@src/hooks/usePortafolioRuta";
import ProductCart from "@src/components/dashboard/clients/ui/ProductCart";
import { EmptyPage } from "./EmptyPage";
import {
  ImageIcon,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const PortafolioPage = () => {
  const { ruta } = useParams();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  // USAR EL NUEVO HOOK
  const {
    data: portafolio = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = usePortafolioRuta(ruta);

  // REDIRECCIÓN SI NO SE ENCUENTRA EL PORTAFOLIO
  useEffect(() => {
    if (!isLoading && !portafolio && !error && ruta) {
      toast.error(`Portafolio "${ruta}" no encontrado`, {
        icon: "❌",
        duration: 3000,
      });
      navigate("/dashboard/portafolio", { replace: true });
    }
  }, [isLoading, portafolio, error, ruta, navigate]);

  // DESCARGAR CATÁLOGO PDF
  const handleDownloadCatalog = async () => {
    if (!portafolio?.catalogo_pdf) {
      toast.error(
        `Catálogo no disponible para ${portafolio?.nombre || "este portafolio"}`,
        {
          icon: "⚠️",
          duration: 3000,
        },
      );
      return;
    }

    setIsDownloading(true);

    try {
      // VALIDAR Y ABRIR PDF EN NUEVA PESTAÑA
      const url = new URL(portafolio.catalogo_pdf, window.location.origin);
      window.open(url.href, "_blank", "noopener,noreferrer");

      toast.success(`Abriendo catálogo de ${portafolio.nombre}`, {
        icon: "📄",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error al abrir catálogo:", err);
      toast.error("Error al abrir el catálogo. Verifica la URL.", {
        icon: <AlertCircle className="text-red-500" size={20} />,
        duration: 4000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // SKELETON PARA LOADING
  const renderSkeleton = () => (
    <div className="min-h-screen flex flex-col">
      <main className="grow py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Botón de regreso skeleton */}
          <div className="h-10 w-24 bg-gray-300 rounded animate-pulse mb-6"></div>

          {/* Header skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
            <div className="space-y-4">
              <div className="h-12 bg-gray-300 rounded w-2/3 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6 animate-pulse"></div>
            </div>
            <div className="bg-gray-300 h-80 rounded-xl animate-pulse"></div>
          </div>

          {/* Catalog section skeleton (opcional) */}
          {Math.random() > 0.5 && (
            <div className="bg-gray-300 h-40 rounded-xl mb-12 animate-pulse"></div>
          )}

          {/* Products section skeleton */}
          <div className="space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="h-56 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // MANEJO DE ERRORES
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="grow flex items-center justify-center p-4">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              No se pudo cargar el portafolio.
            </h3>
            <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
              <button
                onClick={refetch}
                disabled={isRefetching}
                className="inline-flex items-center justify-center px-4 py-2 bg-primario text-white rounded-md hover:bg-secundario transition-colors disabled:opacity-50"
              >
                {isRefetching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar ahora
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Reintentando automáticamente en 10 segundos...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // MOSTRAR SKELETON MIENTRAS CARGA
  if (isLoading || !portafolio) {
    return renderSkeleton();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow">
        {/* Botón de regreso */}
        <div className="container mx-auto px-4 py-5">
          <button
            onClick={() => navigate("/dashboard/portafolio")}
            className="flex hover:text-secundario transition-colors items-center"
            aria-label="Volver"
          >
            <ArrowLeft className="size-5 mr-2" />
            <span className="font-medium">Volver</span>
          </button>
        </div>

        {/* Sección - Información del portafolio */}
        <section className="py-5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h1
                  className="text-4xl md:text-5xl font-bold text-primario mb-6"
                  id={`portafolio-name-${portafolio.id}`}
                >
                  {portafolio.nombre || "Portafolio sin nombre"}
                </h1>
                <h2 className="text-xl md:text-2xl font-bold mb-6">
                  {portafolio.titulo || "Portafolio sin título"}
                </h2>
                <p className="leading-relaxed text-gray-700 text-lg max-w-2xl">
                  {portafolio.descripcion || "Sin descripción disponible"}
                </p>
              </div>

              <div
                className="bg-bgPrimario overflow-hidden rounded-md shadow-xl aspect-[16/9] flex items-center justify-center"
                role="img"
                aria-label={`Imagen representativa de ${portafolio.nombre}`}
              >
                {portafolio.banner ? (
                  <img
                    src={portafolio.banner}
                    alt={`Logo de ${portafolio.nombre}`}
                    className="w-full h-full object-cover rounded-md border-4 border-white"
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-32 h-32 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon
                        className="w-20 h-20 text-gray-200"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sección - Descargar catálogo */}
        <section className="py-5">
          <div className="container mx-auto px-4">
            <div className="bg-primario rounded-md p-4 shadow-xl text-txtBlanco">
              <div className="md:flex justify-between items-center">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <div className="flex justify-start mb-2">
                    <FileText className="size-6 mr-3" aria-hidden="true" />
                    <h2 className="text-xl md:text-2xl font-bold">
                      Catálogo {portafolio.nombre}
                    </h2>
                  </div>
                  <p className="max-w-md mx-auto md:mx-0 hidden md:block">
                    Descarga el catálogo completo en formato PDF.
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleDownloadCatalog}
                    disabled={isDownloading}
                    className={`
                       text-txtBlanco font-bold text-base md:text-lg px-6 py-2 rounded-md shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95
                      ${
                        isDownloading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-bgOscuro hover:bg-secundario"
                      }
                    `}
                    aria-busy={isDownloading}
                    aria-label={`Descargar catálogo PDF de ${portafolio.nombre}`}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Abriendo...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        <span className="sm:inline">Descargar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Productos del portafolio */}
        <section className="pt-5 py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
              <h2 className="text-3xl font-bold text-primario">Productos</h2>
              <p className="text-sm text-gray-600">
                Cantidad:{" "}
                <span className="font-semibold">
                  {portafolio.productos?.length || 0} productos
                </span>
              </p>
            </div>

            {portafolio.productos?.length === 0 ? (
              <div className="flex flex-col min-h-[300px] justify-center items-center">
                <EmptyPage
                  mensaje={`No hay productos disponibles en ${portafolio.nombre}`}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {portafolio.productos.map((producto) => (
                  <ProductCart
                    key={producto.id}
                    id={producto.id}
                    img={producto.img}
                    nombre={producto.nombre}
                    precio={producto.precio}
                    descuento={producto.descuento}
                    precioDescuento={producto.precio_descuento ?? null}
                    destacado={producto.destacado}
                    descripcion={producto.descripcion}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PortafolioPage;
