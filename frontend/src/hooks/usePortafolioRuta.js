import { useAuthStore } from "@src/store/authStore";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@src/lib/axiosInstance";

export const usePortafolioRuta = (ruta) => {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["portafolios-dashboard", ruta],

    queryFn: async () => {
      const response = await axiosInstance.get(`/portafolios-dashboard/`);
      const portafolio = response.data.find((p) => p.ruta === ruta);

      if (!portafolio) {
        throw new Error(`Portafolio con ruta "${ruta}" no encontrado`);
      }

      return portafolio;
    },

    enabled: !!ruta && !!token,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 1000,
  });
};
