import { Router } from "express";
import {
  getProducts,
  createProduct,
  updateProduct, // <-- Added this import
} from "../controllers/product.controller.js";

const router = Router();

// Standard routes for getting all and creating new
router.route("/").get(getProducts).post(createProduct);

// NEW: Route for updating a specific product by its ID
router.route("/:id").patch(updateProduct);

export default router;
