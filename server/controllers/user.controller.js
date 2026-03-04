import User from "../models/user.model.js";
import Submission from "../models/submission.model.js";
import bcryptjs from "bcryptjs";
import { createError } from "../utils/error.js";

// PUT /api/user/profile — update name, profilePicture
export const updateProfile = async (req, res, next) => {
  try {
    const { name, profilePicture } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (profilePicture) updates.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return next(createError(404, "User not found"));

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/user/password — change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createError(400, "Current and new passwords are required"));
    }

    if (newPassword.length < 6) {
      return next(createError(400, "New password must be at least 6 characters"));
    }

    const user = await User.findById(req.user.id);
    if (!user) return next(createError(404, "User not found"));

    const isMatch = bcryptjs.compareSync(currentPassword, user.password);
    if (!isMatch) return next(createError(400, "Current password is incorrect"));

    user.password = bcryptjs.hashSync(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

// GET /api/user/students — list students with submission stats
export const getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Get submission stats per student
    const studentIds = students.map((s) => s._id);
    const stats = await Submission.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: "$studentId",
          totalSubmissions: { $sum: 1 },
          evaluated: { $sum: { $cond: [{ $eq: ["$status", "evaluated"] }, 1, 0] } },
          totalScore: {
            $sum: { $cond: [{ $eq: ["$status", "evaluated"] }, "$score", 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    stats.forEach((s) => {
      statsMap[s._id.toString()] = {
        totalSubmissions: s.totalSubmissions,
        evaluated: s.evaluated,
        averageScore: s.evaluated > 0 ? Math.round((s.totalScore / s.evaluated) * 10) / 10 : 0,
      };
    });

    const studentsWithStats = students.map((s) => ({
      ...s,
      stats: statsMap[s._id.toString()] || { totalSubmissions: 0, evaluated: 0, averageScore: 0 },
    }));

    res.json({ success: true, students: studentsWithStats });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/user/:id — delete student + cascade submissions
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError(404, "User not found"));
    if (user.role === "admin") {
      return next(createError(403, "Cannot delete an admin account"));
    }

    await Submission.deleteMany({ studentId: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Student and their submissions deleted" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/user/account — delete own account
export const deleteOwnAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(createError(404, "User not found"));

    if (user.role === "student") {
      await Submission.deleteMany({ studentId: user._id });
    }

    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("access_token");

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};
