import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@src/store/authStore";
import axiosInstance from "@src/lib/axiosInstance";

export const useAdminCursos = () => {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  // FETCH DE CURSOS
  const cursosQuery = useQuery({
    queryKey: ["admin-cursos"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/cursos/`);

      return response.data.map((curso) => ({
        id: curso.id,
        img: curso.img || null,
        titulo: curso.titulo || "",
        descripcion: curso.descripcion || "",
        profesional: curso.profesional || "",
        link: curso.link || null,
        activo: curso.activo !== undefined ? curso.activo : true,
        creado: curso.creado || null,
        actualizado: curso.actualizado || null,
      }));
    },
    enabled: !!token,
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 5,
    retry: 1,
  });

  // MUTATION: CREAR CURSO
  const createCurso = useMutation({
    mutationFn: async (cursoData) => {
      const response = await axiosInstance.post(`/cursos/`, cursoData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
      queryClient.invalidateQueries({ queryKey: ["cursos-dashboard"] });
    },
  });

  // MUTATION: ACTUALIZAR CURSO
  const updateCurso = useMutation({
    mutationFn: async ({ cursoId, data }) => {
      const response = await axiosInstance.patch(`/cursos/${cursoId}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
      queryClient.invalidateQueries({ queryKey: ["cursos-dashboard"] });
    },
  });

  // MUTATION: ELIMINAR CURSO
  const deleteCurso = useMutation({
    mutationFn: async ({ cursoId }) => {
      await axiosInstance.delete(`/cursos/${cursoId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
      queryClient.invalidateQueries({ queryKey: ["cursos-dashboard"] });
    },
  });

  // MUTATION: TOGGLE ACTIVO/INACTIVO
  const toggleCursoActivo = useMutation({
    mutationFn: async ({ cursoId, activo }) => {
      const response = await axiosInstance.patch(`/cursos/${cursoId}/`, {
        activo,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
    },
  });

  return {
    cursos: cursosQuery.data || [],
    isLoading: cursosQuery.isLoading,
    error: cursosQuery.error,
    refetch: cursosQuery.refetch,
    createCurso,
    updateCurso,
    deleteCurso,
    toggleCursoActivo,
  };
};
