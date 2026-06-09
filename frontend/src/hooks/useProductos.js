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
    // staleTime: 0,
    // cacheTime: 0,
    // refetchOnMount: true,
    // refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 1000,
  });
};
