import express from "express";
import {
  signup,
  signin,
  signout,
  getMe,
  google,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validateSignup, validateSignin } from "../middleware/validate.js";

const router = express.Router();

router.post("/signup", authLimiter, validateSignup, signup);
router.post("/signin", authLimiter, validateSignin, signin);
router.post("/google", authLimiter, google);
router.post("/signout", signout);
router.get("/me", requireAuth, getMe);

export default router;
