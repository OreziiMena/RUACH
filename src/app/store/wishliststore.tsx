import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[]; // We will just store the Product IDs (Slugs)
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void; 
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleWishlist: (productId) => {
        const currentItems = get().items;
        // If it's already wishlisted, remove it. If not, add it.
        if (currentItems.includes(productId)) {
          set({ items: currentItems.filter((id) => id !== productId) });
        } else {
          set({ items: [...currentItems, productId] });
        }
      },
      
      isInWishlist: (productId) => get().items.includes(productId),

      // FIX: This must live safely inside the main state object!
      clearWishlist: () => set({ items: [] }), 
    }),
    {
      name: 'ruach-h-fashion-wishlist', // The name of the storage key in the browser
    }
  )
);