import { create } from "zustand";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "./authStore";
import { unstable_cache } from "next/cache";
import { revalidateOffer } from "@/app/actions/revalidate";

export interface Comment {
  offerId: string;
  name: string;
  comment: string;
  likes: number;
}

export interface Offer {
  id: string;
  menuItemId: string;
  dishName: string;
  dishImage: string;
  originalPrice: number;
  newPrice: number;
  fromTime: Date;
  toTime: Date;
  createdAt: Date;
  hotelId: string;
  hotelName: string;
  area: string;
  hotelLocation: string;
  itemsAvailable: number;
  enquiries: number;
  category: string;
  description?: string;
  qty?: number;
  comments: Comment[];
}

interface OfferState {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  fetchOffers: () => Promise<void>;
  addOffer: (
    offer: Omit<
      Offer,
      | "id"
      | "hotelId"
      | "hotelName"
      | "area"
      | "hotelLocation"
      | "dishName"
      | "dishImage"
      | "originalPrice"
      | "enquiries"
      | "description"
      | "createdAt"
    >
  ) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  incrementEnquiry: (offerId: string, hotelId: string) => Promise<void>;
  addComment: (offerId: string, comment: Omit<Comment, "offerId">) => Promise<void>;
  incrementLike: (offerId: string, commentId: string) => Promise<void>;
  updateOfferComments: (offerId: string, updatedComments: Comment[]) => Promise<void>;
}

export const useOfferStore = create<OfferState>((set) => ({
  offers: [],
  loading: false,
  error: null,

  fetchOffers: async () => {
    try {
      set({ loading: true, error: null });

      const getOffers = unstable_cache(
        async () => {
          const now = new Date().toString();
          const offersCollection = collection(db, "offers");
          const offersQuery = query(
            offersCollection,
            where("toTime", "<", now)
          );
          const querySnapshot = await getDocs(offersQuery);
          const offers: Offer[] = [];
          querySnapshot.forEach((doc) => {
            offers.push({ id: doc.id, ...doc.data() } as Offer);
          });
          return offers;
        },
        ["offers"],
        { tags: ["offers"] }
      );

      const offers = await getOffers();
      set({ offers, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  addOffer: async (offer) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ error: null });
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error("User data not found");
      }

      const userData = userDocSnap.data();
      const menuItems = userData.menu || [];
      const menuItem = menuItems.find(
        (item: { id: string }) => item.id === offer.menuItemId
      );

      if (!menuItem) {
        throw new Error("Menu item not found");
      }

      const offerData = {
        ...offer,
        hotelId: user.uid,
        hotelName: userData.hotelName,
        area: userData.area,
        hotelLocation: userData.location,
        dishName: menuItem.name,
        dishImage: menuItem.image,
        originalPrice: menuItem.price,
        description: menuItem.description || "",
        enquiries: 0,
        category: userData.category || "hotel",
        fromTime: offer.fromTime.toISOString(),
        toTime: offer.toTime.toISOString(),
        createdAt: new Date().toISOString(),
        comments: [],
      };

      const offersRef = collection(db, "offers");
      const addedOffer = await addDoc(offersRef, offerData);

      await revalidateOffer();
      await fetch(`${process.env.NEXT_PUBLIC_WWJS_API_URL}/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offer: { id: addedOffer.id, ...offerData },
        }),
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteOffer: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ error: null });
      const offerRef = doc(db, "offers", id);
      await deleteDoc(offerRef);
      await revalidateOffer();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  incrementEnquiry: async (offerId: string, hotelId: string) => {
    try {
      set({ error: null });

      const hotelRef = doc(db, "users", hotelId);
      await updateDoc(hotelRef, {
        enquiry: increment(1),
      });

      const offerRef = doc(db, "offers", offerId);
      await updateDoc(offerRef, {
        enquiries: increment(1),
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // Update the addComment method
  addComment: async (offerId: string, comment: Omit<Comment, "offerId">) => {
    try {
      set({ error: null });

      const offerRef = doc(db, "offers", offerId);
      const offerSnap = await getDoc(offerRef);

      if (!offerSnap.exists()) {
        throw new Error(`Offer with ID ${offerId} does not exist`);
      }

      const newComment = {
        ...comment,
        offerId, // Include the offerId in the comment
      };

      // Update the comment in Firestore
      await updateDoc(offerRef, {
        comments: arrayUnion(newComment),
      });

      // Now update Zustand state to reflect the new comment
      set((state) => {
        const updatedOffers = state.offers.map((offer) => {
          if (offer.id === offerId) {
            return {
              ...offer,
              comments: [...offer.comments, newComment], // Add comment to the offer in state
            };
          }
          return offer;
        });
        return { offers: updatedOffers };
      });

      await revalidateOffer();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // Update the incrementLike method
  incrementLike: async (offerId: string, commentId: string) => {
    try {
      set({ error: null });

      const offerRef = doc(db, "offers", offerId);
      const offerSnap = await getDoc(offerRef);

      if (!offerSnap.exists()) {
        throw new Error(`Offer with ID ${offerId} does not exist`);
      }

      // Fetch the current offer data to update comments
      const offerData = offerSnap.data();
      const comments = offerData?.comments || [];

      // Find the comment and increment likes
      const updatedComments = comments.map((comment: Comment) => {
        if (comment.offerId === commentId) {
          return { ...comment, likes: comment.likes + 1 };
        }
        return comment;
      });

      // Update the offer's comments in Firestore
      await updateDoc(offerRef, {
        comments: updatedComments,
      });

      // Update the Zustand state to reflect the updated likes
      set((state) => {
        const updatedOffers = state.offers.map((offer) => {
          if (offer.id === offerId) {
            return {
              ...offer,
              comments: updatedComments, // Update the comments with incremented likes
            };
          }
          return offer;
        });
        return { offers: updatedOffers };
      });

      await revalidateOffer();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },


  updateOfferComments: async (offerId: string, updatedComments: Comment[]) => {
    try {
      set({ error: null });

      const offerRef = doc(db, "offers", offerId);

      // Update the comments in Firestore
      await updateDoc(offerRef, {
        comments: updatedComments,
      });

      // Update Zustand state to reflect new comments
      set((state) => {
        const updatedOffers = state.offers.map((offer) => {
          if (offer.id === offerId) {
            return {
              ...offer,
              comments: updatedComments, // Update the offer's comments in state
            };
          }
          return offer;
        });
        return { offers: updatedOffers };
      });

      await revalidateOffer();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));
