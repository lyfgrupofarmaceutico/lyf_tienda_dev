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
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 1000,
  });
};
