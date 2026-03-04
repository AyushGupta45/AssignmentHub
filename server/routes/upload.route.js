import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadFile } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/", requireAuth, upload.single("file"), uploadFile);

export default router;
