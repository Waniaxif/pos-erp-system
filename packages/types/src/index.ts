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
  createdAt: Date;
  updatedAt: Date;
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
  timestamp: Date;
}
