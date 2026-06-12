import { useState, useCallback, useEffect, useRef } from "react";
import { useProductos } from "@src/hooks/useProductos";
import { EmptyPage } from "../ui/EmptyPage";
import { Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import ProductCart from "@src/components/dashboard/clients/ui/ProductCart";
import { Link } from "react-router-dom";

const Tienda = () => {
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");

  // Estado para el boton
  const botonRef = useRef(null);
  const contenedorRef = useRef(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const {
    data: productos = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProductos();

  // Auto-reintentar después de 10 segundos
  useEffect(() => {
    if (error) {
      const retryTimer = setTimeout(() => {
        refetch();
      }, 10000);
      return () => clearTimeout(retryTimer);
    }
  }, [error, refetch]);

  const filtrarProductos = useCallback(() => {
    let resultado = [...productos];

    if (busqueda.trim() !== "") {
      const termino = busqueda.toLowerCase().trim();
      resultado = resultado.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(termino) ||
          producto.descripcion?.toLowerCase().includes(termino),
      );
    }

    switch (tipoFiltro) {
      case "destacados":
        resultado = resultado.filter((p) => p.destacado);
        break;
      case "descuento":
        resultado = resultado.filter((p) => p.descuento && p.descuento > 0);
        break;
      case "asc":
        resultado.sort(
          (a, b) =>
            (a.precioDescuento || a.precio) - (b.precioDescuento || b.precio),
        );
        break;
      case "desc":
        resultado.sort(
          (a, b) =>
            (b.precioDescuento || b.precio) - (a.precioDescuento || a.precio),
        );
        break;
      default:
        break;
    }

    return resultado;
  }, [productos, busqueda, tipoFiltro]);

  const productosFiltrados = filtrarProductos();
  const productosVisibles = mostrarTodos
    ? productosFiltrados
    : productosFiltrados?.slice(0, 8) || [];

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
        top: posicionContenedor,
        behavior: "smooth",
      });

      // Mantenemos el foco en el boton para que nunca se pierda
      setTimeout(() => {
        botonRef.current?.focus({ preventScroll: true });
      }, 150);
    }
  };

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

  // RENDERIZADO PRINCIPAL
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
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  disabled={productos.length === 0}
                  className="flex pl-10 w-full border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed bg-bgPrimario"
                  aria-label="Buscar productos"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sección - Productos */}
        <section ref={contenedorRef} className="mb-16">
          <div className="container mx-auto px-4 md:px-8">
            <h1 className="text-primario text-3xl font-bold pb-2">
              Todos los productos
            </h1>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
              <p className="text-sm">
                Cantidad:{" "}
                <span className="font-semibold ml-1">
                  {productosFiltrados.length} productos
                </span>
              </p>

              <select
                value={tipoFiltro}
                onChange={(e) => {
                  setTipoFiltro(e.target.value);
                  setMostrarTodos(false);
                }}
                disabled={productos.length === 0}
                className="rounded-lg px-4 py-1.5 text-sm focus:outline-none border-2 border-gray-300 focus:border-primario disabled:cursor-not-allowed"
                aria-label="Filtrar productos"
              >
                <option value="todos">Todos</option>
                <option value="destacados">Destacados</option>
                <option value="descuento">En descuento</option>
                <option value="asc">Precio: menor a mayor</option>
                <option value="desc">Precio: mayor a menor</option>
              </select>
            </div>

            {/* MANEJO DE ERRORES */}
            {error ? (
              <div className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  No se pudieron cargar los productos.
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
                {/* Todos los productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {productosVisibles.map((producto) => (
                    <ProductCart
                      key={producto.id}
                      id={producto.id}
                      img={producto.img}
                      nombre={producto.nombre}
                      precio={producto.precio}
                      descuento={producto.descuento}
                      precioDescuento={producto.precio_descuento}
                      destacado={producto.destacado}
                      descripcion={producto.descripcion}
                    />
                  ))}
                </div>

                {/* Sin resultados */}
                {productosFiltrados.length === 0 && productos.length > 0 && (
                  <div className="p-8 text-center border-t border-border">
                    <EmptyPage mensaje="No hay productos que coincidan con tu búsqueda." />
                  </div>
                )}

                {/* Sin productos */}
                {productos.length === 0 && !isLoading && (
                  <div className="p-8 text-center">
                    <EmptyPage mensaje="No hay productos registrados aún" />
                  </div>
                )}

                {/* Ver todos - Ver menos */}
                {!error && productosFiltrados.length > 8 && (
                  <div className="flex justify-center mt-16">
                    <Link
                      ref={botonRef}
                      onClick={manejarMostrarTodos}
                      disabled={isRefetching}
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
      </main>
    </div>
  );
};

export default Tienda;
