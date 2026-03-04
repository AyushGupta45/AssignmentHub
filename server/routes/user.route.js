import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  updateProfile,
  changePassword,
  getStudents,
  deleteUser,
  deleteOwnAccount,
} from "../controllers/user.controller.js";
import {
  validateUpdateProfile,
  validateChangePassword,
  validateMongoId,
} from "../middleware/validate.js";

const router = express.Router();

router.put("/profile", requireAuth, validateUpdateProfile, updateProfile);
router.put("/password", requireAuth, validateChangePassword, changePassword);
router.get("/students", requireAdmin, getStudents);
router.delete("/account", requireAuth, deleteOwnAccount);
router.delete("/:id", requireAdmin, validateMongoId, deleteUser);

export default router;
