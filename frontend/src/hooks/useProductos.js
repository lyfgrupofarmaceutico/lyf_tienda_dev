import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@src/store/authStore";
import axiosInstance from "@src/lib/axiosInstance";

export const useProductos = () => {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["productos-dashboard"],

    queryFn: async () => {
      const response = await axiosInstance.get(`/productos-dashboard/`);

      return response.data;
    },

    enabled: !!token,
    // Caché
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,

    // Refetch
    refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 1000,
  });
};
