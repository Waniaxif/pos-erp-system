export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  stockQuantity: number;
  sku: string;
  category: string; // References Category _id
  createdAt?: string; // Changed from Date to string
  updatedAt?: string; // Changed from Date to string
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export interface Order {
  _id: string;
  cashierId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "COMPLETED" | "REFUNDED" | "PENDING";
  paymentMethod: "CASH" | "CARD";
  timestamp: string; // Changed from Date to string
}
