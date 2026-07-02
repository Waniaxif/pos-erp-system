import { Router } from "express";
import { createOrder, getOrders } from "../controllers/order.controller.js";

const router = Router();

router.route("/").get(getOrders).post(createOrder);

export default router;
