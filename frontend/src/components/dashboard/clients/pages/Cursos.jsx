import { useState, useCallback } from "react";
import { useCursos } from "@src/hooks/useCursos";
import { Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyPage } from "../ui/EmptyPage";
import CursoItem from "../ui/CursoItem";

const Cursos = () => {
  const [busqueda, setBusqueda] = useState("");

  const {
    data: cursos = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCursos();

  // FILTRADO POR BÚSQUEDA
  const cursosFiltrados = useCallback(() => {
    if (!busqueda.trim()) return cursos;

    const termino = busqueda.toLowerCase().trim();
    return cursos.filter(
      (curso) =>
        curso.titulo?.toLowerCase().includes(termino) ||
        curso.descripcion?.toLowerCase().includes(termino) ||
        curso.profesional?.toLowerCase().includes(termino),
    );
  }, [cursos, busqueda]);

  const resultados = cursosFiltrados();

  // SKELETON PARA LOADING
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="bg-bgSecundario rounded-lg overflow-hidden animate-pulse"
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow">
        {/* Sección - Búsqueda y Filtros */}
        <section className="pt-5 pb-5">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col gap-4 w-full md:max-w-xl md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input
                  id="busqueda"
                  name="busqueda"
                  type="text"
                  placeholder="Buscar cursos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  disabled={cursos.length === 0}
                  className="flex pl-10 w-full border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed bg-bgPrimario"
                  aria-label="Buscar cursos"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Seccion - Cursos */}
        <section className="mb-16">
          <div className="container mx-auto px-4 md:px-8">
            <h1 className="text-primario text-3xl font-bold pb-4">
              Todos los cursos
            </h1>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
              <p className="text-sm">
                Cantidad:{" "}
                <span className="font-semibold ml-1">
                  {resultados.length} cursos
                </span>
              </p>
            </div>

            {/* MANEJO DE ERRORES */}
            {error ? (
              <div className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  No se pudieron cargar los cursos.
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
            ) : isLoading ? (
              renderSkeleton()
            ) : (
              <div>
                {/* Todos los cursos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {resultados.map((curso) => (
                    <CursoItem
                      key={curso.id}
                      id={curso.id}
                      img={curso.img}
                      titulo={curso.titulo}
                      descripcion={curso.descripcion}
                      profesional={curso.profesional}
                      link={curso.link}
                    />
                  ))}
                </div>

                {/* Sin resultados */}
                {resultados.length === 0 && cursos.length > 0 && (
                  <div className="flex flex-col min-h-[300px] justify-center">
                    <EmptyPage mensaje="No hay cursos que coincidan con tu búsqueda." />
                  </div>
                )}

                {/* Sin cursos */}
                {cursos.length === 0 && !isLoading && (
                  <div className="p-8 text-center">
                    <EmptyPage mensaje="No hay cursos registrados aún" />
                  </div>
                )}

                {/* Botón de regreso a la tienda */}
                {resultados.length > 0 && (
                  <div className="flex justify-center mt-16">
                    <Link
                      to="/dashboard"
                      className="bg-primario hover:bg-secundario text-txtBlanco font-bold text-base md:text-lg px-6 py-2 rounded-md shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95"
                    >
                      Ir a la tienda
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Cursos;
