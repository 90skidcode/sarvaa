import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface WeightOption {
  weight: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: string;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getItem: (productId: string, weight: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.productId === item.productId && i.weight === item.weight,
        );

        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.weight === item.weight
                ? {
                    ...i,
                    quantity: Math.min(
                      i.quantity + item.quantity,
                      item.maxStock,
                    ),
                  }
                : i,
            ),
          });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                ...item,
                id: `${item.productId}-${item.weight}-${Date.now()}`,
              },
            ],
          });
        }
      },

      removeItem: (productId, weight) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.weight === weight),
          ),
        });
      },

      updateQuantity: (productId, weight, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, weight);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId && item.weight === weight
              ? { ...item, quantity: Math.min(quantity, item.maxStock) }
              : item,
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getItem: (productId, weight) => {
        return get().items.find(
          (item) => item.productId === productId && item.weight === weight,
        );
      },
    }),
    {
      name: "sarvaa-cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Settings store for configuration
interface SettingsStore {
  freeShippingThreshold: number;
  setFreeShippingThreshold: (threshold: number) => void;
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
  freeShippingThreshold: 999, // Default: ₹999
  setFreeShippingThreshold: (threshold) =>
    set({ freeShippingThreshold: threshold }),
}));
