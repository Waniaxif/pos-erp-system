import type { Request, Response } from "express";
import { Product } from "../models/Product.js";

export const getProducts = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, price, stockQuantity, sku, category } = req.body;
    const product = await Product.create({
      name,
      price,
      stockQuantity,
      sku,
      category,
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Failed to create product" });
  }
};

// NEW: Added the updateProduct controller function
export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params; // Get the product ID from the URL
    const updateData = req.body; // Get the fields to update from the request body

    // Find the product by ID and update it
    // { new: true } returns the updated document rather than the old one
    // { runValidators: true } ensures the updated data still follows your Mongoose schema rules
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).populate("category");

    // If no product was found with that ID, return a 404
    if (!updatedProduct) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    // Return the successfully updated product
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Failed to update product" });
  }
};
