import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@src/lib/axiosInstance";

export const usePromocionesLanding = () => {
  return useQuery({
    queryKey: ["promociones-landing"],
    queryFn: async () => {
      // Endpoint público que devuelve promociones
      const response = await axiosInstance.get("/promociones-landing/");

      return response.data;
    },

    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};
