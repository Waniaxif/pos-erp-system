import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_pos_key_123";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    // Auto-seed: Create a default admin if the database is completely empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        name: "System Admin",
        email: "admin@pos.com",
        phone: "03000000000",
        password: "password123",
        role: "ADMIN",
      });
      console.log(
        "[SYSTEM] Default admin created: admin@pos.com / password123",
      );
    }

    // Find user by either email or phone
    const user = (await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    })) as any;

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    // Generate token including the database _id
    const token = jwt.sign(
      { _id: user._id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "12h" },
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: { _id: user._id, name: user.name, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed." });
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    const user = (await User.findById(userId)) as any;
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res
        .status(400)
        .json({ success: false, message: "Incorrect current password." });
      return;
    }

    user.password = newPassword;
    await user.save(); // The pre-save hook will hash this new password

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update password." });
  }
};
