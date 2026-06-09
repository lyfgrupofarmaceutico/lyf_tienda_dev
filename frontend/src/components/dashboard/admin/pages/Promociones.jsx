import { useState, useMemo, useEffect } from "react";
import { useAdminPromociones } from "@src/hooks/useAdminPromociones";
import ModalConfirmarEliminar from "../ui/ModalConfirmarEliminar";
import ModalFormularioPromocion from "../ui/ModalFormularioPromocion";
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
  Tags,
  Edit,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  Image,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Promociones() {
  const {
    promociones = [],
    isLoading,
    error,
    refetch,
    createPromocion,
    updatePromocion,
    deletePromocion,
    togglePromocionActivo,
  } = useAdminPromociones();

  const [globalFilter, setGlobalFilter] = useState("");
  const [activoFilter, setActivoFilter] = useState("todos");
  const [selectedPromocion, setSelectedPromocion] = useState(null);
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

  // FILTRADO DE PROMOCIONES
  const filteredPromociones = useMemo(() => {
    return promociones.filter((promocion) => {
      const searchTerm = globalFilter.toLowerCase().trim();
      const matchesSearch =
        !searchTerm ||
        promocion.nombre?.toLowerCase().includes(searchTerm) ||
        promocion.titulo?.toLowerCase().includes(searchTerm) ||
        promocion.subtitulo?.toLowerCase().includes(searchTerm) ||
        promocion.texto_boton?.toLowerCase().includes(searchTerm);

      const matchesActivo =
        activoFilter === "todos" ||
        (activoFilter === "si" && promocion.activo) ||
        (activoFilter === "no" && !promocion.activo);

      return matchesSearch && matchesActivo;
    });
  }, [promociones, globalFilter, activoFilter]);

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
        cell: ({ row }) => (
          <span className="font-mono text-gray-500">{row.index + 1}</span>
        ),
      },

      {
        accessorKey: "nombre",
        header: "Campaña",
        cell: ({ row }) => (
          <div
            className="font-medium text-gray-800 max-w-xs truncate"
            title={row.original.nombre}
          >
            {row.original.nombre || "Sin nombre"}
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
                alt={row.original.nombre || "Banner"}
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
        accessorKey: "titulo",
        header: "Título",
        cell: ({ row }) => (
          <div
            className="text-sm text-gray-600 max-w-xs truncate"
            title={row.original.titulo}
          >
            {row.original.titulo || "Sin título"}
          </div>
        ),
      },
      {
        accessorKey: "subtitulo",
        header: "Subtítulo",
        cell: ({ row }) => (
          <div
            className="text-sm text-gray-500 max-w-xs truncate"
            title={row.original.subtitulo}
          >
            {row.original.subtitulo || "Sin subtítulo"}
          </div>
        ),
      },
      {
        accessorKey: "descripcion",
        header: "Descripcion",
        cell: ({ row }) => (
          <div
            className="text-sm text-gray-500 max-w-xs truncate"
            title={row.original.descripcion}
          >
            {row.original.descripcion || "Sin descripcion"}
          </div>
        ),
      },
      {
        accessorKey: "texto_boton",
        header: "Botón",
        cell: ({ row }) => (
          <span className="text-xs font-medium bg-destacado px-4 py-1 rounded-full whitespace-nowrap">
            {row.original.texto_boton || "Ver más"}
          </span>
        ),
      },
      {
        accessorKey: "link",
        header: "Link",
        cell: ({ row }) => {
          const link = row.original.link;
          return link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm whitespace-nowrap"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Abrir URL: ${row.original.titulo}`}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Abrir URL
            </a>
          ) : (
            <span className="text-gray-400 text-xs italic">Sin enlace</span>
          );
        },
      },
      {
        accessorKey: "activo",
        header: "Estado",
        cell: ({ row }) => {
          const isActive = row.original.activo;
          const isToggling =
            togglePromocionActivo.isPending &&
            togglePromocionActivo.variables?.promocionId === row.original.id;

          return (
            <button
              disabled={isToggling || togglePromocionActivo.isPending}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-600 border border-green-600"
                    : "bg-red-100 text-red-800 border border-red-200"
                }
                ${isToggling ? "opacity-70 cursor-not-allowed" : ""}
              `}
              aria-label={
                isActive ? "Desactivar promoción" : "Activar promoción"
              }
              title={isActive ? "Activo" : "Inactivo"}
            >
              {isToggling ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : isActive ? (
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
            </button>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const promocion = row.original;
          const isDeleting =
            deletePromocion.isPending &&
            deletePromocion.variables?.promocionId === promocion.id;

          return (
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPromocion(promocion);
                  setShowFormModal(true);
                }}
                className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors"
                aria-label={`Editar promoción ${promocion.nombre}`}
              >
                <Edit className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPromocion(promocion);
                  setShowDeleteModal(true);
                }}
                disabled={isDeleting}
                className={`p-1.5 rounded-full transition-colors ${
                  isDeleting
                    ? "text-red-400 cursor-not-allowed"
                    : "text-red-500 hover:text-red-600"
                }`}
                aria-label={`Eliminar promoción ${promocion.nombre}`}
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
    [togglePromocionActivo, deletePromocion],
  );

  // CONFIGURACIÓN DE LA TABLA
  const table = useReactTable({
    data: filteredPromociones || [],
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
  const handleCreatePromocion = () => {
    setSelectedPromocion(null);
    setShowFormModal(true);
    setIsCreating(true);
  };

  const handleEditPromocion = (promocion) => {
    setSelectedPromocion(promocion);
    setShowFormModal(true);
    setIsCreating(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedPromocion) return;
    deletePromocion.mutate(
      { promocionId: selectedPromocion.id },
      {
        onSuccess: () => {
          toast.success(`Promoción "${selectedPromocion.nombre}" eliminada`, {
            icon: "🗑️",
            duration: 2500,
          });
          setShowDeleteModal(false);
          setSelectedPromocion(null);
        },
        onError: (error) => {
          console.error("Error al eliminar promoción:", error);
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

  const handleFormSubmit = (promocionData) => {
    const isFormData = promocionData instanceof FormData;

    if (isCreating) {
      // CREAR: FormData y JSON se pueden pasar directo
      createPromocion.mutate(promocionData, {
        onSuccess: () => {
          const nombre = isFormData
            ? promocionData.get("titulo")
            : promocionData.titulo;
          toast.success(`Promoción "${nombre}" creada exitosamente`, {
            icon: "✅",
            duration: 2500,
          });
          setShowFormModal(false);
          setSelectedPromocion(null);
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
        for (let [key, value] of promocionData.entries()) {
          formDataWithId.append(key, value);
        }

        updatePromocion.mutate(
          { promocionId: selectedPromocion.id, data: formDataWithId },
          {
            onSuccess: () => {
              const nombre = promocionData.get("titulo");
              toast.success(`Promoción "${nombre}" actualizada`, {
                icon: "✏️",
                duration: 2500,
              });
              setShowFormModal(false);
              setSelectedPromocion(null);
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
        updatePromocion.mutate(
          { promocionId: selectedPromocion.id, data: promocionData },
          {
            onSuccess: () => {
              toast.success(`Promoción "${promocionData.nombre}" actualizada`, {
                icon: "✏️",
                duration: 2500,
              });
              setShowFormModal(false);
              setSelectedPromocion(null);
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
      <div className="flex items-center gap-3 border-l-4 border-l-amber-600 pl-3">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Tags className="h-6 w-6 text-amber-600" /> Promociones
        </h1>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xl">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Buscar promociones..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          disabled={promociones.length === 0}
          className="flex pl-10 w-full border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed bg-bgPrimario"
          aria-label="Buscar promociones"
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
        {/* Botón para crear promoción */}
        <div className="flex">
          <button
            onClick={handleCreatePromocion}
            disabled={createPromocion.isPending}
            className={`
              flex items-center gap-2 px-4 py-1.5 bg-bgOscuro hover:bg-amber-600
              text-txtBlanco rounded-md font-medium transition-colors
              ${createPromocion.isPending ? "opacity-70 cursor-not-allowed" : "disabled:cursor-not-allowed hover:scale-[1.02]"}
            `}
            aria-label="Agregar nueva promoción"
          >
            {createPromocion.isPending ? (
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
            disabled={promociones.length === 0}
            className="pl-3 border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="si">Activas</option>
            <option value="no">Inactivas</option>
          </select>
        </div>
      </div>

      {/* Contador */}
      <div className="flex justify-end">
        <p className="text-sm text-gray-600">
          Mostrando{" "}
          <span className="font-medium">{filteredPromociones.length}</span> de{" "}
          <span className="font-medium">{promociones.length}</span>{" "}
        </p>
      </div>

      {/* Tabla y manejo de errores */}
      {error ? (
        <div className="p-3 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400">
            No se pudieron cargar las promociones.
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
                    onClick={() => handleEditPromocion(row.original)}
                    role="row"
                    aria-label={`Editar promoción ${row.original.nombre}`}
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
          {filteredPromociones.length === 0 && promociones.length > 0 && (
            <div className="p-8 text-center border-t border-border">
              <EmptyPage mensaje="No se encontraron promociones con esos criterios" />
            </div>
          )}

          {/* Sin promociones */}
          {promociones.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <EmptyPage mensaje="No hay promociones registradas aún" />
            </div>
          )}

          {/* Paginación */}
          <div className="border-t border-border p-4 gap-4">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={`
                  p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-amber-600 transition-colors
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
                  p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-amber-600 transition-colors
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
      <ModalFormularioPromocion
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedPromocion(null);
        }}
        onSubmit={handleFormSubmit}
        promocion={selectedPromocion}
        isCreating={isCreating}
        isLoading={createPromocion.isPending || updatePromocion.isPending}
      />

      <ModalConfirmarEliminar
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPromocion(null);
        }}
        onConfirm={handleConfirmDelete}
        productName={`promoción "${selectedPromocion?.nombre || ""}"`}
        isLoading={deletePromocion.isPending}
      />
    </div>
  );
}
