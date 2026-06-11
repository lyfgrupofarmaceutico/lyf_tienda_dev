// hooks/useProductosDestacadosLanding.js
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@src/lib/axiosInstance";

export const useProductosLanding = () => {
  return useQuery({
    queryKey: ["productos-landing"],
    queryFn: async () => {
      // Endpoint público que devuelve productos destacados
      const response = await axiosInstance.get("/productos-landing/");

      return response.data;
    },

    staleTime: 0,
    // Caché
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,

    // Refetch
    refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 1000,
  });
};
