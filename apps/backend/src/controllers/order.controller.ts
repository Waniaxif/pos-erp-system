import type { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { items, subtotal, tax, total, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      res
        .status(400)
        .json({ success: false, message: "Order contains no items." });
      return;
    }

    // 1. Save the order to the database
    const order = await Order.create({
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
    });

    // 2. Deduct stock quantities from the Product inventory
    const stockUpdates = items.map((item: any) =>
      Product.findByIdAndUpdate(
        item._id,
        { $inc: { stockQuantity: -item.cartQuantity } },
        { new: true },
      ),
    );
    await Promise.all(stockUpdates);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Checkout Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process order." });
  }
};

export const getOrders = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
