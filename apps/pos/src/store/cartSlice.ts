import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product, CartItem } from "@pos/types";

interface CartState {
  items: CartItem[];
  subtotal: number;
  taxRate: number; // e.g., 0.16 for 16%
  taxAmount: number;
  total: number;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  taxRate: 0.16, // Configurable tax rate
  taxAmount: 0,
  total: 0,
};

const calculateTotals = (state: CartState): void => {
  state.subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0,
  );
  state.taxAmount = state.subtotal * state.taxRate;
  state.total = state.subtotal + state.taxAmount;
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(
        (item) => item._id === action.payload._id,
      );

      if (existingItem) {
        // Prevent adding more than what's in stock
        if (existingItem.cartQuantity < existingItem.stockQuantity) {
          existingItem.cartQuantity += 1;
        }
      } else {
        if (action.payload.stockQuantity > 0) {
          state.items.push({ ...action.payload, cartQuantity: 1 });
        }
      }
      calculateTotals(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      calculateTotals(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const item = state.items.find((i) => i._id === action.payload.id);
      if (
        item &&
        action.payload.quantity > 0 &&
        action.payload.quantity <= item.stockQuantity
      ) {
        item.cartQuantity = action.payload.quantity;
      }
      calculateTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.taxAmount = 0;
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
