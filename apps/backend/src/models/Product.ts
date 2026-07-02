import { Schema, model, Document } from "mongoose";
import type { Product as IProduct } from "@pos/types";

export interface ProductDocument
  extends Omit<IProduct, "_id" | "createdAt" | "updatedAt">, Document {}

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String, // Storing Category string ID or reference string
      required: true,
      ref: "Category",
    },
  },
  { timestamps: true },
);

export const Product = model<ProductDocument>("Product", productSchema);
