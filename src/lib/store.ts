import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface WeightOption {
  type: string; // e.g., "Grams", "Pieces"
  value: string; // e.g., "250", "1"
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantType: string;
  variantValue: string;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (
    productId: string,
    variantType: string,
    variantValue: string,
  ) => void;
  updateQuantity: (
    productId: string,
    variantType: string,
    variantValue: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getItem: (
    productId: string,
    variantType: string,
    variantValue: string,
  ) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) =>
            i.productId === item.productId &&
            i.variantType === item.variantType &&
            i.variantValue === item.variantValue,
        );

        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: items.map((i) =>
              i.productId === item.productId &&
              i.variantType === item.variantType &&
              i.variantValue === item.variantValue
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
                id: `${item.productId}-${item.variantType}-${item.variantValue}-${Date.now()}`,
              },
            ],
          });
        }
      },

      removeItem: (productId, variantType, variantValue) => {
        set({
          items: get().items.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.variantType === variantType &&
                item.variantValue === variantValue
              ),
          ),
        });
      },

      updateQuantity: (productId, variantType, variantValue, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantType, variantValue);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId &&
            item.variantType === variantType &&
            item.variantValue === variantValue
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

      getItem: (productId, variantType, variantValue) => {
        return get().items.find(
          (item) =>
            item.productId === productId &&
            item.variantType === variantType &&
            item.variantValue === variantValue,
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
