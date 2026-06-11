import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@src/store/authStore";
import axiosInstance from "@src/lib/axiosInstance";

export const useAdminPromociones = () => {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  // FETCH DE PROMOCIONES
  const promocionesQuery = useQuery({
    queryKey: ["admin-promociones"],
    queryFn: async () => {
      const response = await axiosInstance.get("/promociones/");

      return response.data.map((promocion) => ({
        id: promocion.id,
        nombre: promocion.nombre || "",
        banner: promocion.banner || null,
        titulo: promocion.titulo || "",
        subtitulo: promocion.subtitulo || "",
        descripcion: promocion.descripcion || "",
        texto_boton: promocion.texto_boton || "Ver más",
        link: promocion.link || null,
        activo: promocion.activo !== undefined ? promocion.activo : true,
        creado: promocion.creado || null,
        actualizado: promocion.actualizado || null,
      }));
    },
    enabled: !!token,
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 5,
    retry: 1,
  });

  // MUTATION: CREAR PROMOCIÓN
  const createPromocion = useMutation({
    mutationFn: async (promocionData) => {
      const response = await axiosInstance.post(`/promociones/`, promocionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promociones"] });
      queryClient.invalidateQueries({ queryKey: ["promociones-landing"] });
    },
  });

  // MUTATION: ACTUALIZAR PROMOCIÓN
  const updatePromocion = useMutation({
    mutationFn: async ({ promocionId, data }) => {
      const response = await axiosInstance.patch(
        `/promociones/${promocionId}/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promociones"] });
      queryClient.invalidateQueries({ queryKey: ["promociones-landing"] });
    },
  });

  // MUTATION: ELIMINAR PROMOCIÓN
  const deletePromocion = useMutation({
    mutationFn: async ({ promocionId }) => {
      await axiosInstance.delete(`/promociones/${promocionId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promociones"] });
      queryClient.invalidateQueries({ queryKey: ["promociones-landing"] });
    },
  });

  // MUTATION: TOGGLE ACTIVO/INACTIVO
  const togglePromocionActivo = useMutation({
    mutationFn: async ({ promocionId, activo }) => {
      const response = await axiosInstance.patch(
        `/promociones/${promocionId}/`,
        { activo },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promociones"] });
    },
  });

  return {
    promociones: promocionesQuery.data || [],
    isLoading: promocionesQuery.isLoading,
    error: promocionesQuery.error,
    refetch: promocionesQuery.refetch,
    createPromocion,
    updatePromocion,
    deletePromocion,
    togglePromocionActivo,
  };
};
