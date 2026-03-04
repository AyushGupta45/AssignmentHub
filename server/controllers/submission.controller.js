import Submission from "../models/submission.model.js";
import Assignment from "../models/assignment.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { createError } from "../utils/error.js";

// POST /api/assignments/:assignmentId/submissions — student submits
export const createSubmission = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { fileUrl, fileName, fileSize } = req.body;

    if (!fileUrl || !fileName) {
      return next(createError(400, "fileUrl and fileName are required"));
    }

    // Validate assignment exists and is active
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return next(createError(404, "Assignment not found"));
    if (assignment.status !== "active") {
      return next(createError(400, "Assignment is closed for submissions"));
    }

    // Check duplicate
    const existing = await Submission.findOne({
      assignmentId,
      studentId: req.user.id,
    });
    if (existing) {
      return next(createError(400, "You have already submitted for this assignment"));
    }

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user.id,
      fileUrl,
      fileName,
      fileSize: fileSize || 0,
    });

    // Notify admin(s)
    const student = await User.findById(req.user.id).select("name");
    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length > 0) {
      const notifications = admins.map((a) => ({
        userId: a._id,
        message: `New submission from ${student.name} for "${assignment.title}"`,
        type: "assignment",
        link: `/admin/assignments/${assignmentId}`,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, submission });
  } catch (error) {
    next(error);
  }
};

// GET /api/assignments/:assignmentId/submissions — admin gets all submissions
export const getSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Submission.countDocuments({ assignmentId });
    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "name email profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      submissions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/assignments/:assignmentId/submissions/mine — student's own submission
export const getMySubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findOne({
      assignmentId: req.params.assignmentId,
      studentId: req.user.id,
    }).lean();

    res.json({ success: true, submission: submission || null });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/assignments/:assignmentId/submissions/:submissionId/evaluate
export const evaluateSubmission = async (req, res, next) => {
  try {
    const { score, feedback } = req.body;
    if (score == null) return next(createError(400, "Score is required"));

    const submission = await Submission.findById(req.params.submissionId).populate("studentId", "name");
    if (!submission) return next(createError(404, "Submission not found"));
    if (submission.assignmentId.toString() !== req.params.assignmentId) {
      return next(createError(400, "Submission does not belong to this assignment"));
    }

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return next(createError(404, "Assignment not found"));

    if (score < 0 || score > assignment.maxScore) {
      return next(createError(400, `Score must be between 0 and ${assignment.maxScore}`));
    }

    submission.score = score;
    submission.feedback = feedback || "";
    submission.status = "evaluated";
    submission.evaluatedAt = new Date();
    await submission.save();

    // Notify student
    await Notification.create({
      userId: submission.studentId._id || submission.studentId,
      message: `Your submission for "${assignment.title}" has been evaluated. Score: ${score}/${assignment.maxScore}`,
      type: "evaluation",
      link: `/dashboard/assignments/${assignment._id}`,
    });

    res.json({ success: true, submission });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/assignments/:assignmentId/submissions/:submissionId
export const deleteSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return next(createError(404, "Submission not found"));

    // Owner or admin can delete
    if (submission.studentId.toString() !== req.user.id && req.user.role !== "admin") {
      return next(createError(403, "Not authorized to delete this submission"));
    }

    await Submission.findByIdAndDelete(req.params.submissionId);

    res.json({ success: true, message: "Submission deleted" });
  } catch (error) {
    next(error);
  }
};
