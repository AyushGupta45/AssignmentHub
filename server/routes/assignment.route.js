import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  closeAssignment,
} from "../controllers/assignment.controller.js";
import {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateMongoId,
} from "../middleware/validate.js";

const router = express.Router();

router.post("/", requireAdmin, validateCreateAssignment, createAssignment);
router.get("/", requireAuth, getAssignments);
router.get("/:id", requireAuth, validateMongoId, getAssignment);
router.put("/:id", requireAdmin, validateUpdateAssignment, updateAssignment);
router.delete("/:id", requireAdmin, validateMongoId, deleteAssignment);
router.patch("/:id/close", requireAdmin, validateMongoId, closeAssignment);

export default router;
