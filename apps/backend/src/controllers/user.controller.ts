import type { Request, Response } from "express";
import { User } from "../models/User.js";

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    // .select("-password") ensures we NEVER send hashed passwords to the frontend
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("---- NEW USER CREATION ATTEMPT ----");
    console.log("Data received from frontend:", req.body);
    const { name, email, phone, role, password } = req.body;

    // 1. Strict check to see if the password even made it to the backend
    if (!password) {
      console.log("❌ ERROR: Password is missing from req.body!");
      res.status(400).json({
        success: false,
        message: "Password is required but wasn't received.",
      });
      return;
    }

    // 2. MongoDB hates empty strings on unique/sparse fields. Convert "" to undefined.
    const safeEmail = email && email.trim() !== "" ? email : undefined;

    // 3. Check if user already exists
    const query = safeEmail
      ? { $or: [{ email: safeEmail }, { phone }] }
      : { phone };

    // Check if user already exists
    const existingUser = await User.findOne(query);
    if (existingUser) {
      console.log("❌ ERROR: Duplicate phone or email.");
      res
        .status(400)
        .json({ success: false, message: "Email or Phone already in use." });
      return;
    }

    const newUser = await User.create({
      name,
      email: safeEmail,
      phone,
      role,
      password,
    });
    console.log("✅ SUCCESS: User created successfully:", newUser._id);
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    // 5. If it still fails, this will print the EXACT reason to your terminal
    console.error("❌ MONGOOSE ERROR:", (error as { message: string }).message);
    res.status(400).json({ success: false, message: "Failed to create user" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to delete user" });
  }
};
