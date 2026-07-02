import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Category, Order } from "@pos/types";

export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: { _id: string; name: string; role: UserRole };
  };
}

export interface StaffUser {
  name: string;
  phone: string;
  role: UserRole;
}

export interface VerifyOtpResponse {
  success: boolean;
  data: {
    token: string;
    user: StaffUser;
  };
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: Order;
}

export interface SystemUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

// Fixed: Changed category from 'unknown' to 'string' to resolve the cart dispatch type mismatch
export interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const apiSlice = createApi({
  reducerPath: "api",
  // Fixed: Added support for production Vercel environment variables
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api",
  }),
  tagTypes: ["Product", "Category", "Order", "User"],
  endpoints: (builder) => ({
    // --- Queries (GET) ---
    getProducts: builder.query<Product[], void>({
      query: () => "/products",
      transformResponse: (response: ApiResponse<Product[]>) => response.data,
      providesTags: ["Product"],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => "/categories",
      transformResponse: (response: ApiResponse<Category[]>) => response.data,
      providesTags: ["Category"],
    }),

    getOrders: builder.query<Order[], void>({
      query: () => "/orders",
      transformResponse: (response: ApiResponse<Order[]>) => response.data,
      providesTags: ["Order"],
    }),

    // --- Mutations (POST / PUT) ---
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (newCategory) => ({
        url: "/categories",
        method: "POST",
        body: newCategory,
      }),
      transformResponse: (response: ApiResponse<Category>) => response.data,
      invalidatesTags: ["Category"],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      transformResponse: (response: ApiResponse<Product>) => response.data,
      invalidatesTags: ["Product"],
    }),

    createOrder: builder.mutation<Order, Partial<Order>>({
      query: (newOrder) => ({
        url: "/orders",
        method: "POST",
        body: newOrder,
      }),
      transformResponse: (response: ApiResponse<Order>) => response.data,
      invalidatesTags: ["Order", "Product"],
    }),

    sendOtp: builder.mutation<SendOtpResponse, { phone: string }>({
      query: (credentials) => ({
        url: "/auth/send",
        method: "POST",
        body: credentials,
      }),
    }),

    verifyOtp: builder.mutation<
      VerifyOtpResponse,
      { phone: string; code: string }
    >({
      query: (credentials) => ({
        url: "/auth/verify",
        method: "POST",
        body: credentials,
      }),
    }),

    updateProduct: builder.mutation<
      Product,
      Partial<Product> & { _id: string }
    >({
      query: ({ _id, ...patch }) => ({
        url: `/products/${_id}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: ApiResponse<Product> | Product) => {
        return "data" in response ? response.data : response;
      },
      invalidatesTags: ["Product"],
    }),

    login: builder.mutation<
      AuthResponse,
      { identifier: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    updatePassword: builder.mutation<
      { success: boolean; message: string },
      unknown
    >({
      query: (payload) => ({
        url: "/auth/update-password",
        method: "POST",
        body: payload,
      }),
    }),

    getUsers: builder.query<SystemUser[], void>({
      query: () => "/users",
      transformResponse: (response: ApiResponse<SystemUser[]>) => response.data,
      providesTags: ["User"],
    }),

    createUser: builder.mutation<
      SystemUser,
      Partial<SystemUser> & { password?: string }
    >({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateProductMutation,
  useLoginMutation,
  useUpdatePasswordMutation,
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useCreateProductMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} = apiSlice;
