import { Router } from "express";
import { checkAdminAuth } from "../controllers/auth.controller.js";

const router = Router();

router.get("/auth/check", checkAdminAuth);

export default router;
