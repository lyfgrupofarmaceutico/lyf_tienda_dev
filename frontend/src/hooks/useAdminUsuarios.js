import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@src/store/authStore";
import axiosInstance from "@src/lib/axiosInstance";

export const useAdminUsuarios = () => {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  // FETCH DE USUARIOS
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/usuarios/`);

      // MAPEAR SNAKE_CASE
      return response.data.map((user) => ({
        id: user.id,
        nombre: user.first_name || "",
        apellido: user.last_name || "",
        correo: user.email || "",
        rol: user.role || "general",
        is_admin: user.is_admin || false,
        is_verified: user.is_verified || false,
        is_active: user.is_active || false,
        estado: user.is_active
          ? user.is_verified
            ? "activo"
            : "pendiente"
          : "inactivo",
        fechaRegistro: user.date_joined || null,
        ultimoAcceso: user.last_login || null,
      }));
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  // MUTATION: CAMBIAR ROL DE USUARIO
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      const response = await axiosInstance.patch(`/usuarios/${userId}/`, {
        role: newRole,
      });
      return response.data;
    },
    onSuccess: () => {
      // INVALIDAR CACHÉ para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // MUTATION: TOGGLE ESTADO ACTIVO/INACTIVO
  const toggleUserActive = useMutation({
    mutationFn: async ({ userId, isActive }) => {
      const response = await axiosInstance.patch(`/usuarios/${userId}/`, {
        is_active: isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    updateUserRole,
    toggleUserActive,
  };
};
