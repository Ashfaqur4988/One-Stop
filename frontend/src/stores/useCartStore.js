import toast from "react-hot-toast";
import { create } from "zustand";
import axios from "../lib/axios";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,
  loading: false,

  getCartItems: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/cart");
      set({ cart: res.data.cart, loading: false });
      get().calculateTotals();
    } catch (error) {
      set({ loading: false, cart: [] });
      console.log(error.message);
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", {
        productId: product._id,
      });
      toast.success("Product added to cart");

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
    } catch (error) {
      console.log(error.message);
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get(); //get gives the whole state object
    const subTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subTotal;
    if (coupon) {
      const discount = subTotal * (coupon.discountPercentage / 100);
      total = subTotal - discount;
    }

    set({ subTotal, total });
  },
}));
