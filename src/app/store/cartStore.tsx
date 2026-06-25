import { CartContract, CartItemContract } from '@/contracts/cart';
import { handleClientError } from '@/lib/clientErrorHandler';
import axios from 'axios';
import { create } from 'zustand';

interface CartRequest {
  productId: string;
  quantity: number;
  size: string;
}

interface CartStore {
  items: CartItemContract[];
  loadCart: () => Promise<void>;
  addItem: (item: CartRequest) => Promise<void>;
  removeItem: (id: string, size: string) => Promise<void>;
  updateQuantity: (item: CartRequest) => Promise<void>;
  cartTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  loadCart: async () => {
    try {
      const res = await axios.get<CartContract>('/api/cart', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      set({ items: res.data.items });
    } catch (e) {
      set({ items: [] })
    }
  },

  addItem: async (newItem) => {
    try {
      const currentCart = get().items;
      const existingItem = currentCart.find(
        (item) => item.productId === newItem.productId && item.size === newItem.size
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + newItem.quantity;
        const res =await axios.put(`/api/cart/${encodeURIComponent(existingItem.id)}`, {
          quantity: newQuantity,
          size: newItem.size
        });

        const newItemRes = res.data as CartItemContract;
        const updatedCart = currentCart.map((item) =>
          item.id === existingItem.id ? newItemRes : item
        );
        set({ items: updatedCart });

      } else {
        const res = await axios.post('/api/cart', newItem);
        const newItemRes = res.data as CartItemContract;
        set((state) => ({ items: [...state.items, newItemRes] }));
      }
      
    } catch (err) {
      handleClientError(err);
    }
  },

  removeItem: async (id, size) => {
    try {
      await axios.delete(`/api/cart/${encodeURIComponent(id)}?size=${encodeURIComponent(size)}`);
      set((state) => ({ items: state.items.filter((item) => !(item.productId === id && item.size === size)) }));
    } catch (err) {
      handleClientError(err);
    }
  },

  updateQuantity: async (item) => {
    try {
      const res = await axios.put(`/api/cart/${encodeURIComponent(item.productId)}`, {
        quantity: Math.max(1, item.quantity),
        size: item.size
      });
      const updatedItem = res.data as CartItemContract;
      set((state) => ({
        items: state.items.map((i) => (i.id === updatedItem.id ? updatedItem : i))
      }));
    } catch (err) {
      handleClientError(err);
    }
  },

  cartTotal: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
}));

// if (typeof window !== 'undefined') {
//   setTimeout(() => {
//     try {
//       const store = useCartStore.getState();
//       void store.loadCart();
//     } catch (err) {
//       handleClientError(err);
//     }
//   }, 0);
// }