import { body, param, validationResult } from "express-validator";

// Middleware to check results and return 400 with clear messages
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((e) => e.msg)
      .join(". ");
    return res.status(400).json({ success: false, statusCode: 400, message: messages });
  }
  next();
};

/* ---------- Auth ---------- */

export const validateSignup = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

export const validateSignin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

/* ---------- Assignments ---------- */

export const validateCreateAssignment = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .isISO8601()
    .withMessage("Due date must be a valid date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Due date must be in the future");
      }
      return true;
    }),
  body("maxScore")
    .notEmpty()
    .withMessage("Max score is required")
    .isFloat({ gt: 0 })
    .withMessage("Max score must be greater than 0"),
  handleValidationErrors,
];

export const validateUpdateAssignment = [
  param("id").isMongoId().withMessage("Invalid assignment ID"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),
  body("maxScore")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Max score must be greater than 0"),
  handleValidationErrors,
];

/* ---------- Submissions ---------- */

export const validateCreateSubmission = [
  param("assignmentId").isMongoId().withMessage("Invalid assignment ID"),
  body("fileUrl")
    .trim()
    .notEmpty()
    .withMessage("File URL is required")
    .isURL()
    .withMessage("File URL must be a valid URL"),
  body("fileName").trim().notEmpty().withMessage("File name is required"),
  handleValidationErrors,
];

export const validateEvaluateSubmission = [
  param("assignmentId").isMongoId().withMessage("Invalid assignment ID"),
  param("submissionId").isMongoId().withMessage("Invalid submission ID"),
  body("score")
    .notEmpty()
    .withMessage("Score is required")
    .isFloat({ min: 0 })
    .withMessage("Score must be 0 or greater"),
  handleValidationErrors,
];

/* ---------- User / Profile ---------- */

export const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("profilePicture")
    .optional()
    .isURL()
    .withMessage("Profile picture must be a valid URL"),
  handleValidationErrors,
];

export const validateChangePassword = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  handleValidationErrors,
];

/* ---------- Param helpers ---------- */

export const validateMongoId = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  handleValidationErrors,
];

export const validateAssignmentId = [
  param("assignmentId").isMongoId().withMessage("Invalid assignment ID"),
  handleValidationErrors,
];
