import { Schema, model, type Document } from "mongoose";
import type { Order as IOrder } from "@pos/types";

export interface OrderDocument extends Omit<IOrder, "_id">, Document {}

const orderSchema = new Schema<OrderDocument>(
  {
    cashierId: { type: String, required: true, default: "Terminal_01" },
    items: { type: [], required: true }, // Stores the exact state of CartItems at checkout
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["COMPLETED", "REFUNDED", "PENDING"],
      default: "COMPLETED",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD"],
      default: "CASH",
    },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } },
);

export const Order = model<OrderDocument>("Order", orderSchema);
