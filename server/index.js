import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import uploadRoutes from "./routes/upload.route.js";
import assignmentRoutes from "./routes/assignment.route.js";
import submissionRoutes from "./routes/submission.route.js";
import notificationRoutes from "./routes/notification.route.js";
import userRoutes from "./routes/user.route.js";
import { apiLimiter } from "./middleware/rateLimit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            process.env.CLIENT_URL,
            /\.vercel\.app$/,  // allows all vercel preview URLs too
          ]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limit
app.use("/api", apiLimiter);

// Serverless-safe MongoDB connection with isConnected guard
// Vercel functions are stateless — this prevents reconnecting on every cold start
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1,
      minPoolSize: 0,
    });
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    isConnected = false;
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

// DB middleware — injected per-route instead of connecting at startup
const connectMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
};

// Debug endpoints — useful for verifying deployment
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    nodeEnv: process.env.NODE_ENV,
    hasMongo: !!process.env.MONGO_URI,
    hasJwt: !!process.env.JWT_SECRET,
    timestamp: new Date(),
  });
});

app.get("/api/debug-db", async (req, res) => {
  try {
    await connectDB();
    res.json({ success: true, message: "Database connected", timestamp: new Date() });
  } catch (err) {
    res.json({ success: false, message: err.message, timestamp: new Date() });
  }
});

// Routes — all use connectMiddleware
app.use("/api/auth", connectMiddleware, authRoutes);
app.use("/api/upload", connectMiddleware, uploadRoutes);
app.use("/api/assignments", connectMiddleware, assignmentRoutes);
app.use("/api/assignments/:assignmentId/submissions", connectMiddleware, submissionRoutes);
app.use("/api/notifications", connectMiddleware, notificationRoutes);
app.use("/api/user", connectMiddleware, userRoutes);

// Serve React static files (built to /public by Vite)
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ success: false, statusCode, message });
});

// Local dev only — Vercel doesn't use app.listen()
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

export default app;
