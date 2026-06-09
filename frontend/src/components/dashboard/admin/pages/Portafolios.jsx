import { useState, useMemo, useEffect } from "react";
import { useAdminPortafolios } from "@src/hooks/useAdminPortafolios";
import ModalConfirmarEliminar from "../ui/ModalConfirmarEliminar";
import ModalFormularioPortafolio from "../ui/ModalFormularioPortafolio";
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
  BriefcaseBusiness,
  Edit,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  FileText,
  ToggleLeft,
  ToggleRight,
  Image,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Portafolios() {
  const {
    portafolios = [],
    isLoading,
    error,
    refetch,
    createPortafolio,
    updatePortafolio,
    deletePortafolio,
  } = useAdminPortafolios();

  const [globalFilter, setGlobalFilter] = useState("");
  const [activoFilter, setActivoFilter] = useState("todos");
  const [selectedPortafolio, setSelectedPortafolio] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Auto-reintentar después de 10 segundos
  useEffect(() => {
    if (error) {
      const retryTimer = setTimeout(() => {
        refetch();
      }, 10000);
      return () => clearTimeout(retryTimer);
    }
  }, [error, refetch]);

  // FILTRADO DE PORTAFOLIOS
  const filteredPortafolios = useMemo(() => {
    return portafolios.filter((portafolio) => {
      const searchTerm = globalFilter.toLowerCase().trim();
      const matchesSearch =
        !searchTerm ||
        portafolio.nombre.toLowerCase().includes(searchTerm) ||
        portafolio.ruta.toLowerCase().includes(searchTerm) ||
        portafolio.resumen?.toLowerCase().includes(searchTerm) ||
        portafolio.titulo?.toLowerCase().includes(searchTerm);

      const matchesActivo =
        activoFilter === "todos" ||
        (activoFilter === "si" && portafolio.activo) ||
        (activoFilter === "no" && !portafolio.activo);

      return matchesSearch && matchesActivo;
    });
  }, [portafolios, globalFilter, activoFilter]);

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

  // COLUMNAS DE LA TABLA
  const columns = useMemo(
    () => [
      {
        id: "enumeracion",
        header: "#",
        cell: ({ row }) => <span className="font-mono">{row.index + 1}</span>,
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
        accessorKey: "logo",
        header: "Logo",
        cell: ({ row }) => (
          <div className="w-14 h-14 rounded-md overflow-hidden bg-bgPrimario border border-gray-400 flex items-center justify-center">
            {row.original.logo ? (
              <img
                src={row.original.logo}
                alt={row.original.nombre}
                className="w-full h-full object-cover"
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
        accessorKey: "resumen",
        header: "Resumen",
        cell: ({ row }) => (
          <div
            className="text-sm max-w-xs truncate"
            title={row.original.resumen}
          >
            {row.original.resumen || "Sin resumen"}
          </div>
        ),
      },
      {
        accessorKey: "ruta",
        header: "Ruta",
        cell: ({ row }) => (
          <span className="text-sm px-2">{row.original.ruta}</span>
        ),
      },
      {
        accessorKey: "titulo",
        header: "Título",
        cell: ({ row }) => (
          <div
            className="font-medium max-w-xs truncate"
            title={row.original.titulo}
          >
            {row.original.titulo}
          </div>
        ),
      },
      {
        accessorKey: "banner",
        header: "Banner",
        cell: ({ row }) => (
          <div className="w-16 h-14 rounded-md overflow-hidden bg-bgPrimario border border-gray-400 flex items-center justify-center">
            {row.original.banner ? (
              <img
                src={row.original.banner}
                alt={row.original.nombre}
                className="w-full h-full object-cover"
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
        accessorKey: "descripcion",
        header: "Descripcion",
        cell: ({ row }) => (
          <div
            className="text-sm max-w-xs truncate"
            title={row.original.descripcion}
          >
            {row.original.descripcion || "Sin descripcion"}
          </div>
        ),
      },
      {
        accessorKey: "catalogo_pdf",
        header: "Catálogo",
        cell: ({ row }) => {
          const catalogo = row.original.catalogo_pdf;
          return catalogo ? (
            <a
              href={catalogo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm whitespace-nowrap"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Ver catálogo de ${row.original.nombre}`}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Abrir PDF
            </a>
          ) : (
            <span className="text-gray-400 text-xs italic">Sin catálogo</span>
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
          const portafolio = row.original;
          const isDeleting =
            deletePortafolio.isPending &&
            deletePortafolio.variables?.portafolioId === portafolio.id;

          return (
            <div className="flex gap-4">
              <button
                onClick={() => handleEditPortafolio(row.original)}
                className="text-blue-500 hover:text-blue-600 transition-colors"
                aria-label={`Editar portafolio ${portafolio.nombre}`}
              >
                <Edit className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPortafolio(portafolio);
                  setShowDeleteModal(true);
                }}
                disabled={isDeleting}
                className={`transition-colors ${
                  isDeleting
                    ? "text-red-500 cursor-not-allowed"
                    : "text-red-500 hover:text-red-600"
                }`}
                aria-label={`Eliminar portafolio ${portafolio.nombre}`}
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
    [deletePortafolio],
  );

  // CONFIGURACIÓN DE LA TABLA
  const table = useReactTable({
    data: filteredPortafolios || [],
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
  const handleCreatePortafolio = () => {
    setSelectedPortafolio(null);
    setShowFormModal(true);
    setIsCreating(true);
  };

  const handleEditPortafolio = (portafolio) => {
    setSelectedPortafolio(portafolio);
    setShowFormModal(true);
    setIsCreating(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedPortafolio) return;
    deletePortafolio.mutate(
      { portafolioId: selectedPortafolio.id },
      {
        onSuccess: () => {
          toast.success(`Portafolio "${selectedPortafolio.nombre}" eliminado`, {
            icon: "🗑️",
            duration: 2500,
          });
          setShowDeleteModal(false);
          setSelectedPortafolio(null);
        },
        onError: (error) => {
          console.error("Error al eliminar portafolio:", error);
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

  const handleFormSubmit = (portafolioData) => {
    const isFormData = portafolioData instanceof FormData;

    if (isCreating) {
      // CREAR: FormData y JSON se pueden pasar directo
      createPortafolio.mutate(portafolioData, {
        onSuccess: () => {
          const nombre = isFormData
            ? portafolioData.get("nombre")
            : portafolioData.nombre;
          toast.success(`Portafolio "${nombre}" creado exitosamente`, {
            icon: "✅",
            duration: 2500,
          });
          setShowFormModal(false);
          setSelectedPortafolio(null);
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
        for (let [key, value] of portafolioData.entries()) {
          formDataWithId.append(key, value);
        }

        updatePortafolio.mutate(
          {
            portafolioId: selectedPortafolio.id,
            data: formDataWithId,
          },
          {
            onSuccess: () => {
              const nombre = portafolioData.get("nombre");
              toast.success(`Portafolio "${nombre}" actualizado`, {
                icon: "✏️",
                duration: 2500,
              });
              setShowFormModal(false);
              setSelectedPortafolio(null);
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
        updatePortafolio.mutate(
          { portafolioId: selectedPortafolio.id, data: portafolioData },
          {
            onSuccess: () => {
              toast.success(
                `Portafolio "${portafolioData.nombre}" actualizado`,
                {
                  icon: "✏️",
                  duration: 2500,
                },
              );
              setShowFormModal(false);
              setSelectedPortafolio(null);
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
      <div className="flex items-center gap-3 border-l-4 border-l-purple-600 pl-3">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <BriefcaseBusiness className="h-6 w-6 text-purple-600" />
          Portafolios
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
          placeholder="Buscar portafolios..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          disabled={portafolios.length === 0}
          className="flex pl-10 w-full border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed bg-bgPrimario"
          aria-label="Buscar portafolios"
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

      {/* Botón y Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Botón para crear portafolio */}
        <div className="flex">
          <button
            onClick={handleCreatePortafolio}
            disabled={createPortafolio.isPending}
            className={`
              flex items-center gap-2 px-4 py-1.5 bg-bgOscuro hover:bg-purple-600
              text-txtBlanco rounded-md font-medium transition-colors
              ${createPortafolio.isPending ? "opacity-70 cursor-not-allowed" : "disabled:cursor-not-allowed hover:scale-[1.02]"}
            `}
            aria-label="Agregar nuevo portafolio"
          >
            {createPortafolio.isPending ? (
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
        <div className="flex justify-end">
          {/* Filtro por estado */}
          <select
            value={activoFilter}
            onChange={(e) => setActivoFilter(e.target.value)}
            disabled={portafolios.length === 0}
            className="pl-3 border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="si">Activos</option>
            <option value="no">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Contador */}
      <div className="flex justify-end">
        <p className="text-sm">
          Mostrando{" "}
          <span className="font-medium">{filteredPortafolios.length}</span> de{" "}
          <span className="font-medium">{portafolios.length}</span>{" "}
        </p>
      </div>

      {/* Tabla y manejo de errores */}
      {error ? (
        <div className="p-3 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400">
            No se pudieron cargar los portafolios.
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
                    onClick={() => handleEditPortafolio(row.original)}
                    role="row"
                    aria-label={`Editar portafolio ${row.original.nombre}`}
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
          {filteredPortafolios.length === 0 && portafolios.length > 0 && (
            <div className="p-8 text-center border-t border-border">
              <EmptyPage mensaje="No se encontraron portafolios con esos criterios" />
            </div>
          )}

          {/* Sin portafolios */}
          {portafolios.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <EmptyPage mensaje="No hay portafolios registrados aún" />
            </div>
          )}

          {/* Paginación */}
          <div className="border-t border-border p-4 gap-4">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={`
                  p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-purple-600 transition-colors
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
                  p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-purple-600 transition-colors
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
      <ModalFormularioPortafolio
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedPortafolio(null);
        }}
        onSubmit={handleFormSubmit}
        portafolio={selectedPortafolio}
        isCreating={isCreating}
        isLoading={createPortafolio.isPending || updatePortafolio.isPending}
      />

      <ModalConfirmarEliminar
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPortafolio(null);
        }}
        onConfirm={handleConfirmDelete}
        productName={`portafolio "${selectedPortafolio?.nombre || ""}"`}
        isLoading={deletePortafolio.isPending}
      />
    </div>
  );
}
