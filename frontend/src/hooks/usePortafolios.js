import { useAuthStore } from "@src/store/authStore";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@src/lib/axiosInstance";

export const usePortafolios = () => {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["portafolios-dashboard"],

    queryFn: async () => {
      const response = await axiosInstance.get(`/portafolios-dashboard/`);
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
