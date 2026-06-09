import { useState, useEffect, useMemo } from "react";
import { useAdminPanel } from "@src/hooks/useAdminPanel";
import { useAuthStore } from "@src/store/authStore";
import { EmptyPage } from "../../clients/ui/EmptyPage";
import { MetricaTarjeta } from "../ui/MetricaTarjeta";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  UserCog,
  ShoppingCart,
  BriefcaseBusiness,
  GraduationCap,
  Tag,
  Clock,
  LucideLayoutPanelLeft,
  AlertCircle,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";

export default function Panel() {
  const user = useAuthStore((state) => state.user);

  const { data: stats = {}, isLoading, error, refetch } = useAdminPanel();

  // Auto-reintentar después de 10 segundos
  useEffect(() => {
    if (error) {
      const retryTimer = setTimeout(() => {
        refetch();
      }, 10000);
      return () => clearTimeout(retryTimer);
    }
  }, [error, refetch]);

  const [globalFilter, setGlobalFilter] = useState("");

  const skeletonMetricas = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-md border-l-4 border-l-gray-300 shadow-md transition-shadow animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-4">
              <h3 className="h-6 w-20 bg-gray-300 rounded-md"></h3>
              <p className="h-8 w-12 bg-gray-300 rounded-md"></p>
            </div>
            <div className="h-8 w-12 bg-gray-300 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );

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
    </div>
  );

  // DATOS PARA LA TABLA (últimos 10 usuarios)
  const ultimosUsuarios = useMemo(() => {
    return (stats.ultimos_usuarios || [])
      .slice(-10)
      .reverse()
      .map((u, idx) => ({
        ...u,
        enumeracion: (stats.ultimos_usuarios?.length || 0) - idx,
      }));
  }, [stats.ultimos_usuarios]);

  // COLUMNAS DE LA TABLA
  const columns = useMemo(
    () => [
      {
        id: "enumeracion",
        header: "#",
        cell: ({ row }) => <span>{row.original.enumeracion}</span>,
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
            profesional: "bg-blue-100 text-blue-600 border border-blue-600",
            general: "bg-green-100 text-green-600 border border-green-600",
            administrador: "bg-primario text-txtBlanco border border-primario",
          };
          const etiquetas = {
            administrador: "Administrador",
            profesional: "Profesional",
            general: "General",
          };

          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${row.original.is_admin ? estilos["administrador"] : estilos[rol] || "bg-gray-100 text-gray-800"}`}
            >
              {row.original.is_admin ? "Administrador" : etiquetas[rol] || rol}
            </span>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Estado",
        cell: ({ row }) => {
          const isActive = row.original.is_active;
          const isVerified = row.original.is_verified;

          if (isActive && !isVerified) {
            return (
              <span className="px-2 py-1 text-xs font-medium text-amber-600 rounded-full whitespace-nowrap">
                Pendiente verificación...
              </span>
            );
          }

          return (
            <span
              className={`flex w-min items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                isActive
                  ? "bg-green-100 text-green-600 border border-green-600"
                  : "bg-red-100 text-red-600 border border-red-600"
              }`}
            >
              {isActive && isVerified ? (
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
            </span>
          );
        },
      },
    ],
    [],
  );

  // CONFIGURACIÓN DE LA TABLA
  const table = useReactTable({
    data: ultimosUsuarios,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-l-4 border-l-primario pl-3 justify-between">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <LucideLayoutPanelLeft className="h-6 w-6 text-primario" />
          Panel
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:block">
            👋 Hola,{" "}
            <span className="text-primario font-bold capitalize">
              {user?.first_name || "Admin"}
            </span>
          </span>
        </div>
      </div>

      {error ? (
        <div className="p-3 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400">
            No se pudieron cargar las estadísticas.
          </h3>
          <p className="text-gray-400 text-md">
            Reintentando automáticamente en 10 segundos...
          </p>
        </div>
      ) : isLoading ? (
        skeletonMetricas()
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Usuarios */}
          <MetricaTarjeta
            title="Usuarios"
            value={stats.total_usuarios?.toLocaleString() || "0"}
            icon={<UserCog className="h-8 w-8 text-primario" />}
            style={
              "bg-blue-100 border-2 border-gray-300 shadow-xl border-l-4 border-l-primario"
            }
          />

          {/* Productos */}
          <MetricaTarjeta
            title="Productos"
            value={stats.total_productos?.toLocaleString() || "0"}
            icon={<ShoppingCart className="h-8 w-8 text-green-600" />}
            style={
              "bg-green-100 border-2 border-gray-300 shadow-xl border-l-4 border-l-green-600"
            }
          />

          {/* Portafolios */}
          <MetricaTarjeta
            title="Portafolios"
            value={stats.total_portafolios?.toLocaleString() || "0"}
            icon={<BriefcaseBusiness className="h-8 w-8 text-purple-600" />}
            style={
              "bg-purple-100 border-2 border-gray-300 shadow-xl border-l-4 border-l-purple-600"
            }
          />

          {/* Cursos */}
          <MetricaTarjeta
            title="Cursos"
            value={stats.total_cursos?.toLocaleString() || "0"}
            icon={<GraduationCap className="h-8 w-8 text-cyan-600" />}
            style={
              "bg-cyan-100 border-2 border-gray-300 shadow-xl border-l-4 border-l-cyan-600"
            }
          />

          {/* Promociones */}
          <MetricaTarjeta
            title="Promociones"
            value={stats.total_promociones?.toLocaleString() || "0"}
            icon={<Tag className="h-8 w-8 text-amber-600" />}
            style={
              "bg-amber-100 border-2 border-gray-300 shadow-xl border-l-4 border-l-amber-600"
            }
          />
        </div>
      )}

      {/* Últimos 10 usuarios */}
      <div className="overflow-hidden">
        <div className="my-6 flex items-center gap-3 border-l-4 border-l-primario pl-3">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primario" />
            Últimos 10 usuarios registrados
          </h1>
        </div>

        {error ? (
          <div className="p-3 text-center">
            <div className="flex justify-center mb-2">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400">
              No se pudieron cargar los últimos usuarios.
            </h3>
            <p className="text-gray-400 text-md">
              Reintentando automáticamente en 10 segundos...
            </p>
          </div>
        ) : isLoading ? (
          skeletonTabla()
        ) : ultimosUsuarios.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyPage mensaje="No hay usuarios registrados aún" />
          </div>
        ) : (
          <div className="bg-bgPrimario rounded-md border overflow-hidden">
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
                    <tr key={row.id} role="row" aria-label="Últimos usuarios">
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
          </div>
        )}
      </div>
    </div>
  );
}
