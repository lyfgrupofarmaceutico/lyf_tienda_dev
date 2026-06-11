import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@src/store/authStore";
import axiosInstance from "@src/lib/axiosInstance";

export const useAdminPortafolios = () => {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  // FETCH DE PORTAFOLIOS
  const portafoliosQuery = useQuery({
    queryKey: ["admin-portafolios"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/portafolios/`);

      // Devolver datos del backend
      return response.data.map((portafolio) => ({
        id: portafolio.id,
        nombre: portafolio.nombre || "",
        logo: portafolio.logo || null,
        resumen: portafolio.resumen || "",
        ruta: portafolio.ruta || "",
        titulo: portafolio.titulo || "",
        banner: portafolio.banner || null,
        descripcion: portafolio.descripcion || "",
        catalogo_pdf: portafolio.catalogo_pdf || null,
        activo: portafolio.activo || false,
        creado: portafolio.creado || null,
        actualizado: portafolio.actualizado || null,
      }));
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  // MUTATION: CREAR PORTAFOLIO
  const createPortafolio = useMutation({
    mutationFn: async (portafolioData) => {
      const response = await axiosInstance.post(
        `/portafolios/`,
        portafolioData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portafolios"] });
    },
  });

  // MUTATION: ACTUALIZAR PORTAFOLIO
  const updatePortafolio = useMutation({
    mutationFn: async ({ portafolioId, data }) => {
      const response = await axiosInstance.patch(
        `/portafolios/${portafolioId}/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portafolios"] });
    },
  });

  // MUTATION: ELIMINAR PORTAFOLIO
  const deletePortafolio = useMutation({
    mutationFn: async ({ portafolioId }) => {
      await axiosInstance.delete(`/portafolios/${portafolioId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portafolios"] });
    },
  });

  // MUTATION: TOGGLE ACTIVO/INACTIVO
  const togglePortafolioActivo = useMutation({
    mutationFn: async ({ portafolioId, activo }) => {
      const response = await axiosInstance.patch(
        `/portafolios/${portafolioId}/`,
        { activo },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portafolios"] });
    },
  });

  return {
    portafolios: portafoliosQuery.data || [],
    isLoading: portafoliosQuery.isLoading,
    error: portafoliosQuery.error,
    refetch: portafoliosQuery.refetch,
    createPortafolio,
    updatePortafolio,
    deletePortafolio,
    togglePortafolioActivo,
  };
};
