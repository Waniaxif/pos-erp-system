import { Router } from "express";
import { login, updatePassword } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/update-password", updatePassword);

export default router;
