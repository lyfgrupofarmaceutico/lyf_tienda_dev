// hooks/useContactoLanding.js
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@src/lib/axiosInstance";

export const useContactoLanding = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.post("/contact/", formData);
      return response.data;
    },
    retry: 1,
    retryDelay: 1000,
    // onError global para logging (opcional, ya manejamos UI en el componente)
    onError: (error) => {
      console.error("❌ Error en mutación contacto:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    },
  });
};
