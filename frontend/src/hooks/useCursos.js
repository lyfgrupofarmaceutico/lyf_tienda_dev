import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@src/store/authStore";
import axiosInstance from "@src/lib/axiosInstance";

export const useCursos = () => {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["cursos-dashboard"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/cursos-dashboard/`);
      const cursos = response.data;

      // Los cursos ya vienen filtrados por rol desde el backend
      return cursos;
    },
    enabled: !!token,
    // staleTime: 0,
    // cacheTime: 0,
    // refetchOnMount: true,
    // refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 1000,

    // MANEJO DE ERRORES
    onError: (error) => {
      console.error("Error al cargar cursos:", error);
    },
  });
};
