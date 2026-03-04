import Assignment from "../models/assignment.model.js";
import Submission from "../models/submission.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { createError } from "../utils/error.js";

// POST /api/assignments — admin creates assignment
export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, maxScore, attachmentUrl, attachmentName } = req.body;

    if (!title || !description || !dueDate || maxScore == null) {
      return next(createError(400, "Title, description, dueDate, and maxScore are required"));
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      maxScore,
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: attachmentName || undefined,
      createdBy: req.user.id,
    });

    // Notify all students
    const students = await User.find({ role: "student" }).select("_id");
    if (students.length > 0) {
      const notifications = students.map((s) => ({
        userId: s._id,
        message: `New assignment: ${title}`,
        type: "assignment",
        link: `/dashboard/assignments/${assignment._id}`,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

// GET /api/assignments — list assignments with pagination
export const getAssignments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const total = await Assignment.countDocuments(filter);
    const assignments = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (req.user.role === "admin") {
      // Include submission counts for each assignment
      const assignmentIds = assignments.map((a) => a._id);
      const submissionCounts = await Submission.aggregate([
        { $match: { assignmentId: { $in: assignmentIds } } },
        {
          $group: {
            _id: "$assignmentId",
            total: { $sum: 1 },
            evaluated: { $sum: { $cond: [{ $eq: ["$status", "evaluated"] }, 1, 0] } },
          },
        },
      ]);

      const countMap = {};
      submissionCounts.forEach((s) => {
        countMap[s._id.toString()] = { total: s.total, evaluated: s.evaluated };
      });

      const totalStudents = await User.countDocuments({ role: "student" });

      assignments.forEach((a) => {
        const counts = countMap[a._id.toString()] || { total: 0, evaluated: 0 };
        a.submissionCount = counts.total;
        a.evaluatedCount = counts.evaluated;
        a.totalStudents = totalStudents;
      });
    } else {
      // Student: include their submission status per assignment
      const submissions = await Submission.find({
        assignmentId: { $in: assignments.map((a) => a._id) },
        studentId: req.user.id,
      }).lean();

      const subMap = {};
      submissions.forEach((s) => {
        subMap[s.assignmentId.toString()] = s;
      });

      assignments.forEach((a) => {
        a.mySubmission = subMap[a._id.toString()] || null;
      });
    }

    res.json({
      success: true,
      assignments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/assignments/:id — single assignment
export const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) return next(createError(404, "Assignment not found"));

    if (req.user.role === "admin") {
      // Include all submissions with student info
      const submissions = await Submission.find({ assignmentId: assignment._id })
        .populate("studentId", "name email profilePicture")
        .sort({ createdAt: -1 })
        .lean();
      assignment.submissions = submissions;

      // Stats
      const totalStudents = await User.countDocuments({ role: "student" });
      const evaluated = submissions.filter((s) => s.status === "evaluated");
      assignment.stats = {
        totalStudents,
        submissionCount: submissions.length,
        evaluatedCount: evaluated.length,
        averageScore:
          evaluated.length > 0
            ? Math.round((evaluated.reduce((sum, s) => sum + s.score, 0) / evaluated.length) * 10) / 10
            : 0,
      };
    } else {
      // Student: include only their own submission
      const submission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user.id,
      }).lean();
      assignment.mySubmission = submission || null;
    }

    res.json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

// PUT /api/assignments/:id — update assignment
export const updateAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, maxScore, attachmentUrl, attachmentName } = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, maxScore, attachmentUrl, attachmentName },
      { new: true, runValidators: true }
    );

    if (!assignment) return next(createError(404, "Assignment not found"));

    res.json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/assignments/:id — delete assignment + cascade
export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return next(createError(404, "Assignment not found"));

    await Submission.deleteMany({ assignmentId: assignment._id });
    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Assignment and related submissions deleted" });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/assignments/:id/close — set status to 'closed'
export const closeAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return next(createError(404, "Assignment not found"));

    assignment.status = assignment.status === "closed" ? "active" : "closed";
    await assignment.save();

    res.json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};
