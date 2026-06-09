import { useState, useMemo, useEffect } from "react";
import { useAdminCursos } from "@src/hooks/useAdminCursos";
import ModalConfirmarEliminar from "../ui/ModalConfirmarEliminar";
import ModalFormularioCurso from "../ui/ModalFormularioCurso";
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
  GraduationCap,
  Edit,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  Video,
  ToggleLeft,
  ToggleRight,
  Image,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Cursos() {
  const {
    cursos = [],
    isLoading,
    error,
    refetch,
    createCurso,
    updateCurso,
    deleteCurso,
    toggleCursoActivo,
  } = useAdminCursos();

  const [globalFilter, setGlobalFilter] = useState("");
  const [activoFilter, setActivoFilter] = useState("todos");
  const [selectedCurso, setSelectedCurso] = useState(null);
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

  // FILTRADO DE CURSOS
  const filteredCursos = useMemo(() => {
    return cursos.filter((curso) => {
      const searchTerm = globalFilter.toLowerCase().trim();
      const matchesSearch =
        !searchTerm ||
        curso.titulo.toLowerCase().includes(searchTerm) ||
        curso.descripcion?.toLowerCase().includes(searchTerm) ||
        curso.profesional?.toLowerCase().includes(searchTerm);

      const matchesActivo =
        activoFilter === "todos" ||
        (activoFilter === "si" && curso.activo) ||
        (activoFilter === "no" && !curso.activo);

      return matchesSearch && matchesActivo;
    });
  }, [cursos, globalFilter, activoFilter]);

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
        accessorKey: "img",
        header: "Portada",
        cell: ({ row }) => (
          <div className="w-14 h-14 rounded-md overflow-hidden bg-bgPrimario border border-gray-400 flex items-center justify-center">
            {row.original.img ? (
              <img
                src={row.original.img}
                alt={row.original.titulo}
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
        accessorKey: "titulo",
        header: "Título",
        cell: ({ row }) => (
          <div
            className="font-medium text-gray-800 max-w-xs truncate"
            title={row.original.titulo}
          >
            {row.original.titulo}
          </div>
        ),
      },
      {
        accessorKey: "profesional",
        header: "Profesional",
        cell: ({ row }) => (
          <span
            className="text-sm text-gray-600 max-w-xs truncate"
            title={row.original.profesional}
          >
            {row.original.profesional || "Sin asignar"}
          </span>
        ),
      },
      {
        accessorKey: "activo",
        header: "Estado",
        cell: ({ row }) => {
          const isActive = row.original.activo;
          const isToggling =
            toggleCursoActivo.isPending &&
            toggleCursoActivo.variables?.cursoId === row.original.id;

          return (
            <button
              disabled={isToggling || toggleCursoActivo.isPending}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors
                ${
                  isActive
                    ? "bg-green-100 text-green-600 border border-green-600"
                    : "bg-red-100 text-red-600 border border-red-600"
                }
                ${isToggling ? "opacity-70 cursor-not-allowed" : ""}
              `}
              aria-label={isActive ? "Desactivar curso" : "Activar curso"}
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
        accessorKey: "link",
        header: "Video",
        cell: ({ row }) => {
          const link = row.original.link;
          return link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Ver video: ${row.original.titulo}`}
            >
              <Video className="h-4 w-4" aria-hidden="true" />
              Ver video
            </a>
          ) : (
            <span className="text-gray-400 text-xs italic">Sin enlace</span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const curso = row.original;
          const isDeleting =
            deleteCurso.isPending &&
            deleteCurso.variables?.cursoId === curso.id;

          return (
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCurso(curso);
                  setShowFormModal(true);
                }}
                className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors"
                aria-label={`Editar curso ${curso.titulo}`}
              >
                <Edit className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCurso(curso);
                  setShowDeleteModal(true);
                }}
                disabled={isDeleting}
                className={`p-1.5 rounded-full transition-colors ${
                  isDeleting
                    ? "text-red-400 cursor-not-allowed"
                    : "text-red-500 hover:text-red-600"
                }`}
                aria-label={`Eliminar curso ${curso.titulo}`}
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
    [toggleCursoActivo, deleteCurso],
  );

  // CONFIGURACIÓN DE LA TABLA
  const table = useReactTable({
    data: filteredCursos || [],
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
  const handleCreateCurso = () => {
    setSelectedCurso(null);
    setShowFormModal(true);
    setIsCreating(true);
  };

  const handleEditCurso = (curso) => {
    setSelectedCurso(curso);
    setShowFormModal(true);
    setIsCreating(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedCurso) return;
    deleteCurso.mutate(
      { cursoId: selectedCurso.id },
      {
        onSuccess: () => {
          toast.success(`Curso "${selectedCurso.titulo}" eliminado`, {
            icon: "🗑️",
            duration: 2500,
          });
          setShowDeleteModal(false);
          setSelectedCurso(null);
        },
        onError: (error) => {
          console.error("Error al eliminar curso:", error);
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

  const handleFormSubmit = (cursoData) => {
    const isFormData = cursoData instanceof FormData;

    if (isCreating) {
      // CREAR: FormData y JSON se pueden pasar directo
      createCurso.mutate(cursoData, {
        onSuccess: () => {
          const nombre = isFormData
            ? cursoData.get("titulo")
            : cursoData.titulo;
          toast.success(`Curso "${nombre}" creado exitosamente`, {
            icon: "✅",
            duration: 2500,
          });
          setShowFormModal(false);
          setSelectedCurso(null);
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
        for (let [key, value] of cursoData.entries()) {
          formDataWithId.append(key, value);
        }

        updateCurso.mutate(
          { cursoId: selectedCurso.id, data: formDataWithId },
          {
            onSuccess: () => {
              const nombre = cursoData.get("titulo");
              toast.success(`Curso "${nombre}" actualizado`, {
                icon: "✏️",
                duration: 2500,
              });
              setShowFormModal(false);
              setSelectedCurso(null);
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
        updateCurso.mutate(
          { cursoId: selectedCurso.id, data: cursoData },
          {
            onSuccess: () => {
              toast.success(`Curso "${cursoData.titulo}" actualizado`, {
                icon: "✏️",
                duration: 2500,
              });
              setShowFormModal(false);
              setSelectedCurso(null);
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
      <div className="flex items-center gap-3 border-l-4 border-l-cyan-600 pl-3">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-cyan-600" />
          Cursos
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
          placeholder="Buscar cursos..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          disabled={cursos.length === 0}
          className="flex pl-10 w-full border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed bg-bgPrimario"
          aria-label="Buscar cursos"
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
        {/* Botón para crear curso */}
        <div className="flex">
          <button
            onClick={handleCreateCurso}
            disabled={createCurso.isPending}
            className={`
              flex items-center gap-2 px-4 py-1.5 bg-bgOscuro hover:bg-cyan-600
              text-txtBlanco rounded-md font-medium transition-colors
              ${createCurso.isPending ? "opacity-70 cursor-not-allowed" : "disabled:cursor-not-allowed hover:scale-[1.02]"}
            `}
            aria-label="Agregar nuevo curso"
          >
            {createCurso.isPending ? (
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
            disabled={cursos.length === 0}
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
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{filteredCursos.length}</span>{" "}
          de <span className="font-medium">{cursos.length}</span>{" "}
        </p>
      </div>

      {/* Tabla y manejo de errores */}
      {error ? (
        <div className="p-3 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400">
            No se pudieron cargar los cursos.
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
                    onClick={() => handleEditCurso(row.original)}
                    role="row"
                    aria-label={`Editar curso ${row.original.titulo}`}
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
          {filteredCursos.length === 0 && cursos.length > 0 && (
            <div className="p-8 text-center border-t border-border">
              <EmptyPage mensaje="No se encontraron cursos con esos criterios" />
            </div>
          )}

          {/* Sin cursos */}
          {cursos.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <EmptyPage mensaje="No hay cursos registrados aún" />
            </div>
          )}

          {/* Paginación */}
          <div className="border-t border-border p-4 gap-4">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={`
                  p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-cyan-600 transition-colors
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
                  p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-cyan-600 transition-colors
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
      <ModalFormularioCurso
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedCurso(null);
        }}
        onSubmit={handleFormSubmit}
        curso={selectedCurso}
        isCreating={isCreating}
        isLoading={createCurso.isPending || updateCurso.isPending}
      />

      <ModalConfirmarEliminar
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCurso(null);
        }}
        onConfirm={handleConfirmDelete}
        productName={`curso "${selectedCurso?.titulo || ""}"`}
        isLoading={deleteCurso.isPending}
      />
    </div>
  );
}
