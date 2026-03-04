import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { validateMongoId } from "../middleware/validate.js";

const router = express.Router();

router.get("/", requireAuth, getNotifications);
router.patch("/read-all", requireAuth, markAllAsRead);
router.patch("/:id/read", requireAuth, validateMongoId, markAsRead);

export default router;
