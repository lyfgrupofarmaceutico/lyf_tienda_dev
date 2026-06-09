import { useState, useMemo, useEffect } from "react";
import { useAdminProductos } from "@src/hooks/useAdminProductos";
import { useAdminPortafolios } from "@src/hooks/useAdminPortafolios";
import ModalConfirmarEliminar from "../ui/ModalConfirmarEliminar";
import ModalFormularioProducto from "../ui/ModalFormularioProducto";
import { EmptyPage } from "../../clients/ui/EmptyPage";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  Image,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Productos() {
  const {
    products = [],
    isLoading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProductos();

  const { portafolios = [] } = useAdminPortafolios();

  const [globalFilter, setGlobalFilter] = useState("");
  const [tipoUsuarioFilter, setTipoUsuarioFilter] = useState("todos");
  const [destacadoFilter, setDestacadoFilter] = useState("todos");
  const [portafolioFilter, setPortafolioFilter] = useState("todos");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Lista unica de portafolios
  const portafoliosUnicos = useMemo(() => {
    const map = new Map();
    portafolios.forEach((portafolio) => {
      if (portafolio.id && portafolio.nombre) {
        map.set(portafolio.id, {
          id: portafolio.id,
          nombre: portafolio.nombre,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    );
  }, [portafolios]);

  // Auto-reintentar después de 10 segundos
  useEffect(() => {
    if (error) {
      const retryTimer = setTimeout(() => {
        refetch();
      }, 10000);
      return () => clearTimeout(retryTimer);
    }
  }, [error, refetch]);

  // Filtrado
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchTerm = globalFilter.toLowerCase().trim();
      const matchesSearch =
        !searchTerm ||
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.descripcion?.toLowerCase().includes(searchTerm) ||
        product.portafolio?.nombre?.toLowerCase().includes(searchTerm) ||
        (product.portafolio?.id &&
          product.portafolio.id.toString().includes(searchTerm));

      const matchesTipoUsuario =
        tipoUsuarioFilter === "todos" ||
        product.tipo_usuario === tipoUsuarioFilter;

      const matchesDestacado =
        destacadoFilter === "todos" ||
        (destacadoFilter === "si" && product.destacado) ||
        (destacadoFilter === "no" && !product.destacado);

      const matchesPortafolio =
        portafolioFilter === "todos" ||
        (product.portafolio?.id &&
          product.portafolio.id.toString() === portafolioFilter);

      return (
        matchesSearch &&
        matchesTipoUsuario &&
        matchesDestacado &&
        matchesPortafolio
      );
    });
  }, [
    products,
    globalFilter,
    tipoUsuarioFilter,
    destacadoFilter,
    portafolioFilter,
  ]);

  // SKELETON UI DURANTE CARGA
  const skeletonTabla = () => (
    <div className="bg-bgPrimario rounded-md shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="animate-pulse">
            <tr className="bg-black/20">
              {[...Array(8)].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="animate-pulse">
            {[...Array(10)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3">
                    <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 flex justify-end animate-pulse">
        <div className="h-8 w-48 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  // COLUMNAS
  const columns = useMemo(
    () => [
      {
        id: "enumeracion",
        header: "#",
        cell: ({ row }) => <span className="font-mono">{row.index + 1}</span>,
      },
      {
        accessorKey: "img",
        header: "Imagen",
        cell: ({ row }) => (
          <div className="w-14 h-14 rounded-md overflow-hidden bg-bgPrimario border border-gray-400 flex items-center justify-center">
            {row.original.img ? (
              <img
                src={row.original.img}
                alt={row.original.nombre}
                className="w-full h-full object-contain"
                loading="eager"
              />
            ) : (
              <div className="text-gray-300">
                <Image />
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) => (
          <div
            className="font-medium max-w-xs truncate"
            title={row.original.nombre}
          >
            {row.original.nombre}
          </div>
        ),
      },
      {
        accessorKey: "portafolio",
        header: "Portafolio",
        cell: ({ row }) => {
          const portafolio = row.original.portafolio;
          return (
            <span
              className={`text-sm font-medium max-w-[100px] truncate`}
              title={portafolio?.nombre || "Sin asignar"}
            >
              {portafolio?.nombre || "Sin asignar"}
            </span>
          );
        },
      },
      {
        accessorKey: "precio",
        header: "Precio",
        cell: ({ row }) => (
          <span className="font-medium">
            ${row.original.precio.toLocaleString("es-CO")}
          </span>
        ),
      },
      {
        accessorKey: "descuento",
        header: "Dto. %",
        cell: ({ row }) => {
          const descuento = row.original.descuento;
          if (!descuento || descuento <= 0) return null;
          return (
            <div className="flex justify-center">
              <span className="bg-descuento px-2 py-1 rounded-full text-xs font-bold">
                -{descuento}%
              </span>
            </div>
          );
        },
      },
      {
        id: "precioFinal",
        header: "Final",
        cell: ({ row }) => {
          const precioFinal =
            row.original.precio_descuento || row.original.precio;
          return (
            <span className="font-medium text-primario">
              ${precioFinal.toLocaleString("es-CO")}
            </span>
          );
        },
      },
      {
        accessorKey: "destacado",
        header: "Destacado",
        cell: ({ row }) => {
          const isDestacado = row.original.destacado;

          return (
            <div className="flex justify-center">
              <Star
                className={`h-5 w-5 ${isDestacado ? "fill-destacado" : ""}`}
                aria-hidden="true"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "tipo_usuario",
        header: "Público",
        cell: ({ row }) => {
          const tipoUsuario = row.original.tipo_usuario || "general";
          const estilos = {
            general: "bg-green-100 text-green-600 border border-green-600",
            profesional: "bg-blue-100 text-blue-600 border border-blue-600",
          };
          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${estilos[tipoUsuario]}`}
            >
              {tipoUsuario === "general" ? "General" : "Profesional"}
            </span>
          );
        },
      },
      {
        accessorKey: "activo",
        header: "Estado",
        cell: ({ row }) => {
          const isActive = row.original.activo;

          return (
            <div
              className={`
                 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors
                 ${
                   isActive
                     ? "bg-green-100 text-green-600 border border-green-600"
                     : "bg-red-100 text-red-600 border border-red-600"
                 }`}
            >
              {isActive ? (
                <>
                  <ToggleRight
                    className="h-3 w-3 text-green-600"
                    aria-hidden="true"
                  />
                  Activo
                </>
              ) : (
                <>
                  <ToggleLeft
                    className="h-3 w-3 text-red-600"
                    aria-hidden="true"
                  />
                  Inactivo
                </>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const product = row.original;
          const isDeleting =
            deleteProduct.isPending &&
            deleteProduct.variables?.productId === product.id;
          return (
            <div className="flex gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(product);
                  setShowFormModal(true);
                }}
                className="text-blue-500 hover:text-blue-600 transition-colors"
                aria-label={`Editar producto ${product.nombre}`}
              >
                <Edit className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(product);
                  setShowDeleteModal(true);
                }}
                disabled={isDeleting}
                className={`transition-colors ${
                  isDeleting
                    ? "text-red-500 cursor-not-allowed"
                    : "text-red-500 hover:text-red-600"
                }`}
                aria-label={`Eliminar producto ${product.nombre}`}
              >
                {isDeleting ? (
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          );
        },
      },
    ],
    [deleteProduct],
  );

  // CONFIGURACIÓN DE LA TABLA
  const table = useReactTable({
    data: filteredProducts || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  // MANEJADORES
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowFormModal(true);
    setIsCreating(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowFormModal(true);
    setIsCreating(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedProduct) return;
    deleteProduct.mutate(
      { productId: selectedProduct.id },
      {
        onSuccess: () => {
          toast.success(`Producto "${selectedProduct.nombre}" eliminado`, {
            icon: "🗑️",
            duration: 2500,
          });
          setShowDeleteModal(false);
          setSelectedProduct(null);
        },
        onError: (error) => {
          console.error("Error al eliminar producto:", error);
          toast.error(
            `Error al eliminar: ${error.message || "Intenta nuevamente"}`,
            {
              icon: <AlertCircle className="text-red-500" size={20} />,
              duration: 4000,
            },
          );
          setShowDeleteModal(false);
        },
      },
    );
  };

  const handleFormSubmit = (productData) => {
    const isFormData = productData instanceof FormData;

    if (isCreating) {
      createProduct.mutate(productData, {
        onSuccess: () => {
          const nombre = isFormData
            ? productData.get("nombre")
            : productData.nombre;
          toast.success(`Producto "${nombre}" creado exitosamente`, {
            icon: "✅",
            duration: 2500,
          });
          setShowFormModal(false);
          setSelectedProduct(null);
        },
        onError: (error) => {
          toast.error(
            `Error al crear: ${error.message || "Verifica los datos"}`,
            {
              icon: <AlertCircle className="text-red-500" size={20} />,
              duration: 4000,
            },
          );
        },
      });
    } else {
      // ACTUALIZAR
      if (isFormData) {
        // Actualizar con archivos
        const formDataWithId = new FormData();
        for (let [key, value] of productData.entries()) {
          formDataWithId.append(key, value);
        }

        updateProduct.mutate(
          { productId: selectedProduct.id, data: formDataWithId },
          {
            onSuccess: () => {
              const nombre = productData.get("nombre");
              toast.success(`Producto "${nombre}" actualizado`, {
                icon: "✏️",
                duration: 2500,
              });
              setShowFormModal(false);
              setSelectedProduct(null);
            },
            onError: (error) => {
              toast.error(
                `Error al actualizar: ${error.message || "Verifica los datos"}`,
                {
                  icon: <AlertCircle className="text-red-500" size={20} />,
                  duration: 4000,
                },
              );
            },
          },
        );
      } else {
        // Actualizar solo texto (JSON)
        updateProduct.mutate(
          { productId: selectedProduct.id, data: productData },
          {
            onSuccess: () => {
              toast.success(`Producto "${productData.nombre}" actualizado`, {
                icon: "✏️",
                duration: 2500,
              });
              setShowFormModal(false);
              setSelectedProduct(null);
            },
            onError: (error) => {
              toast.error(
                `Error al actualizar: ${error.message || "Verifica los datos"}`,
                {
                  icon: <AlertCircle className="text-red-500" size={20} />,
                  duration: 4000,
                },
              );
            },
          },
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-l-4 border-green-600 pl-3">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-green-600" />
          Productos
        </h1>
      </div>

      {/* Search bar */}
      <div className="relative w-full sm:max-w-[50%]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          disabled={products.length === 0}
          className="flex pl-10 w-full border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed bg-bgPrimario"
          aria-label="Buscar productos"
        />
        {globalFilter && (
          <button
            onClick={() => setGlobalFilter("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-5 w-5 text-destructivo" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Boton y Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Boton para crear producto */}
        <div className="flex">
          <button
            onClick={handleCreateProduct}
            disabled={createProduct.isPending}
            className={`
             flex items-center gap-2 px-4 py-1.5 bg-bgOscuro hover:bg-green-600
             text-txtBlanco rounded-md font-medium transition-colors
             ${createProduct.isPending ? "opacity-70 cursor-not-allowed" : "disabled:cursor-not-allowed"}
           `}
            aria-label="Agregar nuevo producto"
          >
            {createProduct.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Agregar
              </>
            )}
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Filtro por tipo de usuario */}
          <select
            value={tipoUsuarioFilter}
            onChange={(e) => setTipoUsuarioFilter(e.target.value)}
            disabled={products.length === 0}
            className="pl-3 border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed"
            aria-label="Filtrar por tipo de usuario"
          >
            <option value="todos">Todos los tipos</option>
            <option value="general">Público general</option>
            <option value="profesional">Profesionales</option>
          </select>

          {/* Filtro por destacado */}
          <select
            value={destacadoFilter}
            onChange={(e) => setDestacadoFilter(e.target.value)}
            disabled={products.length === 0}
            className="pl-3 border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed"
            aria-label="Filtrar por productos destacados"
          >
            <option value="todos">Todos</option>
            <option value="si">Destacados</option>
            <option value="no">No destacados</option>
          </select>

          {/* Filtro por portafolio */}
          <select
            value={portafolioFilter}
            onChange={(e) => setPortafolioFilter(e.target.value)}
            disabled={products.length === 0}
            className="pl-3 border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed"
            aria-label="Filtrar por portafolio"
          >
            <option value="todos">Todos los portafolios</option>
            {portafoliosUnicos.map((p) => (
              <option key={p.id} value={p.id.toString()}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contador */}
      <div className="flex justify-end">
        <p className="text-sm">
          Mostrando{" "}
          <span className="font-medium">{filteredProducts.length}</span> de{" "}
          <span className="font-medium">{products.length}</span>{" "}
        </p>
      </div>

      {/* Tabla y manejo de errores */}
      {error ? (
        <div className="p-3 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400">
            No se pudieron cargar los productos.
          </h3>
          <p className="text-gray-400 text-md">
            Reintentando automáticamente en 10 segundos...
          </p>
        </div>
      ) : isLoading ? (
        skeletonTabla()
      ) : (
        <div className="bg-bgPrimario rounded-md shadow-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-bgOscuro sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-semibold text-txtBlanco whitespace-nowrap"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleEditProduct(row.original)}
                    role="row"
                    aria-label={`Editar producto ${row.original.nombre}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm"
                        role="cell"
                        onClick={
                          cell.column.id === "actions"
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sin resultados */}
          {filteredProducts.length === 0 && products.length > 0 && (
            <div className="p-8 text-center border-t border-border">
              <EmptyPage mensaje="No se encontraron productos con esos criterios" />
            </div>
          )}

          {/* Sin productos */}
          {products.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <EmptyPage mensaje="No hay productos registrados aún" />
            </div>
          )}

          {/* Paginación */}
          <div className="border-t border-border p-4 gap-4">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={`
                 p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-green-600 transition-colors
               `}
                aria-label="Página anterior"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                Pág. {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={`
                 p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-green-600 transition-colors
               `}
                aria-label="Página siguiente"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <ModalFormularioProducto
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        isCreating={isCreating}
        isLoading={createProduct.isPending || updateProduct.isPending}
        portafolios={portafoliosUnicos}
      />

      <ModalConfirmarEliminar
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        productName={selectedProduct?.nombre || ""}
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
}
