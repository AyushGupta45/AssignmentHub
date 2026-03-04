import express from "express";
import { requireAuth, requireAdmin, requireStudent } from "../middleware/auth.js";
import {
  createSubmission,
  getSubmissions,
  getMySubmission,
  evaluateSubmission,
  deleteSubmission,
} from "../controllers/submission.controller.js";
import {
  validateCreateSubmission,
  validateEvaluateSubmission,
  validateAssignmentId,
} from "../middleware/validate.js";

const router = express.Router({ mergeParams: true });

router.post("/", requireStudent, validateCreateSubmission, createSubmission);
router.get("/", requireAdmin, validateAssignmentId, getSubmissions);
router.get("/mine", requireStudent, validateAssignmentId, getMySubmission);
router.patch("/:submissionId/evaluate", requireAdmin, validateEvaluateSubmission, evaluateSubmission);
router.delete("/:submissionId", requireAuth, deleteSubmission);

export default router;
