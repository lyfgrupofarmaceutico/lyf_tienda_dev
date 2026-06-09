import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Precio final de los productos agregados al carro
const precioFinal = (item) => item.precioDescuento ?? item.precio;

export const useCartStore = create(
  persist(
    (set, get) => ({
      isOpen: false,

      toogleClose: () =>
        set((state) => ({
          isOpen: !state.isOpen,
        })),

      isOpenConfirm: false,

      closeConfirm: () =>
        set((state) => ({
          isOpenConfirm: !state.isOpenConfirm,
        })),

      cart: [],

      addItemToCart: (item) => {
        const existing = get().cart.find((i) => i.id === item.id);
        if (existing) {
          get().updateItemToCart({
            ...item,
            cantidad: existing.cantidad + item.cantidad,
          });
        } else {
          set((state) => ({
            cart: [...state.cart, { ...item, fechaAgregado: new Date() }],
          }));
        }
      },

      updateItemToCart: (item) => {
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, ...item } : i,
          ),
        }));
      },

      deleteItemToCart: (id) => {
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== id),
        }));
      },

      resetCart: () =>
        set(() => ({
          cart: [],
        })),

      totalCart: () =>
        get().cart.reduce(
          (acc, item) => acc + item.cantidad * precioFinal(item),
          0,
        ),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
      }),
    },
  ),
);
