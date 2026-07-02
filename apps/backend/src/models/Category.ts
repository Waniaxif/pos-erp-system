import { Schema, model, Document } from "mongoose";
import type { Category as ICategory } from "@pos/types";

export interface CategoryDocument extends Omit<ICategory, "_id">, Document {}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

export const Category = model<CategoryDocument>("Category", categorySchema);
