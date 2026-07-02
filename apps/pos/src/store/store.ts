import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    cart: cartReducer,
    // Future reducers (like cartSlice or authSlice) will go here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Strict typing for your React components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
