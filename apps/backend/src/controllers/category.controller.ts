import type { Request, Response } from "express";
import { Category } from "../models/Category.js";

export const getCategories = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, slug, description } = req.body;
    const category = await Category.create({ name, slug, description });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Failed to create category" });
  }
};
