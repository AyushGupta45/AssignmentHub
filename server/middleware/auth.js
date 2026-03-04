import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";

export const requireAuth = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(createError(401, "Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return next(createError(401, "Invalid or expired token"));
  }
};

export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== "admin") {
      return next(createError(403, "Admin access required"));
    }
    next();
  });
};

export const requireStudent = (req, res, next) => {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== "student") {
      return next(createError(403, "Student access required"));
    }
    next();
  });
};
