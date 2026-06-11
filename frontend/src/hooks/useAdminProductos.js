import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@src/store/authStore";
import axiosInstance from "@src/lib/axiosInstance";

export const useAdminProductos = () => {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  // FETCH DE PRODUCTOS
  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      // RUTA RELATIVA SIN headers manuales
      const response = await axiosInstance.get("/productos/");

      // TRANSFORMAR A ESTRUCTURA ANIDADA PARA EL FRONTEND
      return response.data.map((product) => ({
        id: product.id,
        img: product.img || null,
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        precio: product.precio || 0,
        descuento: product.descuento || 0,
        precio_descuento: product.precio_descuento || null,
        destacado: product.destacado || false,
        tipo_usuario: product.tipo_usuario || "general",
        activo: product.activo || false,
        // CREAR OBJETO PORTAFOLIO A PARTIR DE CAMPOS PLANOS DEL BACKEND
        portafolio: product.portafolio
          ? {
              id: product.portafolio,
              nombre:
                product.portafolio_nombre || `Portafolio ${product.portafolio}`,
              ruta: product.portafolio_ruta || "",
            }
          : null,
      }));
    },
    enabled: !!token,
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 5,
    retry: 1,
    retryDelay: 1000,
  });

  // MUTATIONS: Crear producto
  const createProduct = useMutation({
    mutationFn: async (productData) => {
      const response = await axiosInstance.post(`/productos/`, productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["productos-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["productos-landing"] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ productId, data }) => {
      const response = await axiosInstance.patch(
        `/productos/${productId}/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["productos-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["productos-landing"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async ({ productId }) => {
      await axiosInstance.delete(`/productos/${productId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["productos-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["productos-landing"] });
    },
  });

  const toggleDestacado = useMutation({
    mutationFn: async ({ productId, isDestacado }) => {
      const response = await axiosInstance.patch(`/productos/${productId}/`, {
        destacado: isDestacado,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    refetch: productsQuery.refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleDestacado,
  };
};
