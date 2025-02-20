import { create } from 'zustand';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from './authStore';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  hotelId: string;
  category: string;
}

interface MenuState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  hotelInfo: {
    hotelName: string;
    verified: boolean;
  } | null;
  selectedHotelId: string | null;
  setSelectedHotelId: (id: string | null) => void;
  fetchMenu: (hotelId?: string) => Promise<void>;
  addItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  hotelInfo: null,
  selectedHotelId: null,

  setSelectedHotelId: (id) => set({ selectedHotelId: id }),

  fetchMenu: async (hotelId?: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });
      const targetId = hotelId || user.uid;
      
      const q = query(
        collection(db, "menuItems"),
        where("hotelId", "==", targetId)
      );
      
      const querySnapshot = await getDocs(q);
      const items: MenuItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem);
      });

      set({ items });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    try {
      set({ error: null });
      const menuItemsRef = collection(db, 'menuItems');
      const docRef = await addDoc(menuItemsRef, item);
      const newItem = { ...item, id: docRef.id };
      set({ items: [...get().items, newItem] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateItem: async (id, updatedItem) => {
    try {
      set({ error: null });
      await updateDoc(doc(db, 'menuItems', id), updatedItem);
      const items = get().items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      );
      set({ items });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteItem: async (id) => {
    try {
      set({ error: null });
      await deleteDoc(doc(db, 'menuItems', id));
      const items = get().items.filter((item) => item.id !== id);
      set({ items });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
