import { useState, useMemo, useEffect } from "react";
import { useAdminUsuarios } from "@src/hooks/useAdminUsuarios";
import { EmptyPage } from "../../clients/ui/EmptyPage";
import ModalInfoUsuario from "../ui/ModalInfoUsuario";
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
  Eye,
  Search,
  UserCog,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import ModalEstadoUsuario from "../ui/ModalEstadoUsuario";

export default function Usuarios() {
  const {
    users = [],
    isLoading,
    error,
    refetch,
    updateUserRole,
    toggleUserActive,
  } = useAdminUsuarios();

  const [tipoUsuarioFilter, setTipoUsuarioFilter] = useState("todos");
  const [globalFilter, setGlobalFilter] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Auto-reintentar después de 10 segundos
  useEffect(() => {
    if (error) {
      const retryTimer = setTimeout(() => {
        refetch();
      }, 10000);
      return () => clearTimeout(retryTimer);
    }
  }, [error, refetch]);

  // FILTRADO DE USUARIOS
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = globalFilter.toLowerCase().trim();
      const matchesSearch =
        !term ||
        user.nombre?.toLowerCase().includes(term) ||
        user.apellido?.toLowerCase().includes(term) ||
        user.correo?.toLowerCase().includes(term) ||
        user.estado?.toLowerCase().includes(term);

      const matchesTipoUsuario =
        tipoUsuarioFilter === "todos" || user.rol === tipoUsuarioFilter;

      return matchesSearch && matchesTipoUsuario;
    });
  }, [users, globalFilter, tipoUsuarioFilter]);

  // SKELETON UI DURANTE CARGA
  const skeletonTabla = () => (
    <div className="bg-white rounded-md shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-bgPrimario">
          <thead className="sticky top-0 z-10 animate-pulse">
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
        cell: ({ row }) => <span>{row.index + 1}</span>,
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) => (
          <div className="font-medium capitalize">
            {row.original.nombre} {row.original.apellido}
          </div>
        ),
      },
      {
        accessorKey: "correo",
        header: "Correo",
        cell: ({ row }) => (
          <div
            className="text-sm truncate max-w-xs"
            title={row.original.correo}
          >
            {row.original.correo}
          </div>
        ),
      },
      {
        accessorKey: "rol",
        header: "Rol",
        cell: ({ row }) => {
          const rol = row.original.rol;
          const estilos = {
            profesional: "bg-blue-100 text-blue-600 border-blue-600",
            general: "bg-green-100 text-green-600 border-green-600",
          };
          const etiquetas = {
            profesional: "Profesional",
            general: "General",
          };

          // Solo admins pueden cambiar rol de otros usuarios
          if (row.original.is_admin) {
            return (
              <div className="flex w-32 justify-center items-center bg-primario text-txtBlanco px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap gap-1 opacity-50 cursor-not-allowed">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Administrador
              </div>
            );
          }

          return (
            <select
              value={rol}
              onChange={(e) => {
                if (e.target.value !== rol) {
                  setPendingAction({
                    type: "role",
                    user: row.original,
                    newValue: e.target.value,
                  });
                  setShowConfirmModal(true);
                }
              }}
              className={`
                px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap border
                ${estilos[rol] || "bg-bgPrimario"}
                ${row.original.is_admin ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-opacity-80"}
                focus:outline-none
              `}
              disabled={row.original.is_admin}
              aria-label={`Cambiar rol de ${row.original.nombre} ${row.original.apellido}`}
            >
              <option className="bg-bgPrimario text-txtNegro" value="general">
                {etiquetas.general}
              </option>
              <option
                className="bg-bgPrimario text-txtNegro"
                value="profesional"
              >
                {etiquetas.profesional}
              </option>
            </select>
          );
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
          const isActive = row.original.is_active;

          return (
            <button
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-not-allowed
                ${
                  isActive
                    ? "bg-green-100 text-green-600 border border-green-600"
                    : "bg-red-100 text-red-600 border border-red-600"
                }
                
              `}
              aria-label={isActive ? "Desactivar usuario" : "Activar usuario"}
              title={isActive ? "Activo" : "Inactivo"}
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
            </button>
          );
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const user = row.original;

          // No mostrar acciones para usuarios administradores (protección)
          if (user.is_admin) {
            return (
              <div className="flex w-28 justify-center items-center bg-primario text-txtBlanco px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap gap-1 opacity-50 cursor-not-allowed">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                <span>Protegido</span>
              </div>
            );
          }

          // No mostrar acciones para usuarios pendientes
          if (!user.is_verified) {
            return (
              <span className="text-xs font-medium text-amber-600 whitespace-nowrap">
                Pendiente verificación...
              </span>
            );
          }

          return (
            <div className="flex flex-wrap gap-1">
              {user.estado !== "activo" && (
                <button
                  onClick={() => {
                    setPendingAction({
                      type: "state",
                      user,
                      newValue: "activo",
                    });
                    setShowConfirmModal(true);
                  }}
                  disabled={toggleUserActive.isPending}
                  className={`w-28 justify-center px-2 py-1 text-xs font-medium rounded-full bg-green-500 border border-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-1
                  `}
                  aria-label={`Activar usuario ${user.nombre} ${user.apellido}`}
                >
                  {toggleUserActive.isPending &&
                  pendingAction?.user?.id === user.id &&
                  pendingAction?.newValue === "activo" ? (
                    <Loader2
                      className="h-3 w-3 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <UserCheck className="h-3 w-3" aria-hidden="true" />
                  )}
                  Activar
                </button>
              )}

              {user.estado !== "inactivo" && (
                <button
                  onClick={() => {
                    setPendingAction({
                      type: "state",
                      user,
                      newValue: "inactivo",
                    });
                    setShowConfirmModal(true);
                  }}
                  disabled={toggleUserActive.isPending}
                  className={`w-28 justify-center px-2 py-1 text-xs font-medium rounded-full bg-red-500 border border-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50
                    flex items-center gap-1
                  `}
                  aria-label={`Desactivar usuario ${user.nombre} ${user.apellido}`}
                >
                  {toggleUserActive.isPending &&
                  pendingAction?.user?.id === user.id &&
                  pendingAction?.newValue === "inactivo" ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <UserX className="h-4 w-4" aria-hidden="true" />
                  )}
                  Desactivar
                </button>
              )}
            </div>
          );
        },
      },
      {
        id: "informacion",
        header: "Info.",
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedUser(row.original);
              setShowInfoModal(true);
            }}
            className="p-1.5 hover:text-primario rounded-full hover:bg-gray-100 transition-colors"
            aria-label={`Ver información detallada de ${row.original.nombre} ${row.original.apellido}`}
          >
            <Eye className="h-5 w-5" aria-hidden="true" />
          </button>
        ),
      },
    ],
    [toggleUserActive.isPending, pendingAction],
  );

  // CONFIGURACIÓN DE LA TABLA
  const table = useReactTable({
    data: filteredUsers || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  // EJECUTAR ACCIÓN CONFIRMADA
  const handleConfirmAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === "role") {
      // Cambiar rol del usuario
      updateUserRole.mutate(
        { userId: pendingAction.user.id, newRole: pendingAction.newValue },
        {
          onSuccess: () => {
            toast.success(`Rol actualizado a "${pendingAction.newValue}"`, {
              icon: "✅",
              duration: 2500,
            });
            setShowConfirmModal(false);
            setPendingAction(null);
          },
          onError: (error) => {
            console.error("Error al cambiar rol:", error);
            toast.error(
              `Error al cambiar rol: ${error.message || "Intenta nuevamente"}`,
              {
                icon: <AlertCircle className="text-red-500" size={20} />,
                duration: 4000,
              },
            );
            setShowConfirmModal(false);
            setPendingAction(null);
          },
        },
      );
    } else if (pendingAction.type === "state") {
      // Cambiar estado activo/inactivo
      toggleUserActive.mutate(
        {
          userId: pendingAction.user.id,
          isActive: pendingAction.newValue === "activo",
        },
        {
          onSuccess: () => {
            toast.success(
              `Usuario ${pendingAction.newValue === "activo" ? "activado" : "desactivado"}`,
              {
                icon: "✅",
                duration: 2500,
              },
            );
            setShowConfirmModal(false);
            setPendingAction(null);
          },
          onError: (error) => {
            console.error("Error al cambiar estado:", error);
            toast.error(
              `Error al ${pendingAction.newValue === "activo" ? "activar" : "desactivar"}: ${error.message || "Intenta nuevamente"}`,
              {
                icon: <AlertCircle className="text-red-500" size={20} />,
                duration: 4000,
              },
            );
            setShowConfirmModal(false);
            setPendingAction(null);
          },
        },
      );
    }
  };

  // TÍTULO Y MENSAJE DEL MODAL DE CONFIRMACIÓN
  const getModalTitle = () => {
    if (!pendingAction) return "";
    return pendingAction.type === "role"
      ? `¿Cambiar rol de usuario?`
      : `¿${pendingAction.newValue === "activo" ? "Activar" : "Desactivar"} usuario?`;
  };

  const getModalMessage = () => {
    if (!pendingAction) return "";

    const fullName =
      `${pendingAction.user.nombre} ${pendingAction.user.apellido}` || "nombre";

    return (
      <div>
        {pendingAction.type === "role" ? (
          <div>
            Cambiaras el rol de{" "}
            <span className="capitalize font-medium">{fullName}</span> a "
            {pendingAction.newValue}".
          </div>
        ) : (
          <div>
            ¿Deseas{" "}
            {pendingAction.newValue === "activo" ? "activar" : "desactivar"} a{" "}
            <span className="capitalize font-medium">{fullName}</span>?
          </div>
        )}
      </div>
    );
  };

  const getTextConfirm = () => {
    return pendingAction?.type === "role"
      ? "Cambiar rol"
      : pendingAction?.newValue === "activo"
        ? "Activar"
        : "Desactivar";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-l-4 border-l-primario pl-3">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <UserCog className="h-6 w-6 text-primario" />
          Usuarios
        </h1>
      </div>

      {/* Barra de busqueda */}
      <div className="relative w-full sm:max-w-[50%]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          disabled={users.length === 0}
          className="flex pl-10 w-full border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed bg-bgPrimario"
          aria-label="Buscar usuarios"
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

      {/* Filtros */}
      <div className="flex justify-end mb-3">
        {/* Filtros */}
        <div>
          {/* Filtro por tipo de usuario */}
          <select
            value={tipoUsuarioFilter}
            onChange={(e) => setTipoUsuarioFilter(e.target.value)}
            disabled={users.length === 0}
            className="pl-3 border-2 border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-primario focus-visible:outline-none disabled:cursor-not-allowed"
            aria-label="Filtrar por tipo de usuario"
          >
            <option value="todos">Todos</option>
            <option value="general">Público general</option>
            <option value="profesional">Profesionales</option>
          </select>
        </div>
      </div>

      {/* Contador */}
      <div className="flex justify-end">
        <div className="text-right">
          <p className="text-sm">
            Mostrando{" "}
            <span className="font-medium">{filteredUsers.length}</span> de{" "}
            <span className="font-medium">{users.length}</span>{" "}
          </p>
        </div>
      </div>

      {/* Tabla y manejo de errores */}
      {error ? (
        <div className="p-3 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400">
            No se pudieron cargar los usuarios.
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
                  <tr key={row.id} role="row" aria-label="Tabla de usuarios">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm"
                        role="cell"
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

          {filteredUsers.length === 0 && users.length > 0 && (
            <div className="p-8 text-center border-t border-border">
              <EmptyPage mensaje="No se encontraron usuarios con esos criterios" />
            </div>
          )}

          {/* Sin productos */}
          {users.length === 0 && !isLoading && (
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
                p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-primario transition-colors
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
                p-2 border border-border rounded-md text-txtBlanco disabled:cursor-not-allowed bg-bgOscuro hover:bg-primario transition-colors
              `}
                aria-label="Página siguiente"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalEstadoUsuario
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmAction}
        title={getModalTitle()}
        message={getModalMessage()}
        textConfirm={getTextConfirm()}
        isLoading={updateUserRole.isPending || toggleUserActive.isPending}
      />

      {/* Modal de información de usuario */}
      <ModalInfoUsuario
        isOpen={showInfoModal}
        user={selectedUser}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}
