import express, {
  type Request,
  type Response,
  type Application,
} from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import orderRoutes from "./routes/order.routes.js";

import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

// Load environment variables
dotenv.config();

const app: Application = express();
// const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Strict Type-Safe Database Connection
const connectDB = async (): Promise<void> => {
  try {
    const uri: string | undefined = process.env.MONGO_URI;

    if (!uri) {
      throw new Error(
        "MongoDB URI is not defined in the environment variables.",
      );
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB Compass Connected Successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`❌ Database Connection Error: ${error.message}`);
    } else {
      console.error("❌ An unknown error occurred during database connection.");
    }
    process.exit(1);
  }
};

// Health Check Route
app.get("/api/health", (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "POS Backend API is running locally.",
  });
});

// Initialize Server
const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on http://127.0.0.1:${PORT}`);
  });
};

// At the bottom of your server.ts file
const PORT = process.env.PORT || 5000;

// Only listen locally. Vercel will handle the routing in production.
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
// You MUST export the app for Vercel to use it
export default app;
