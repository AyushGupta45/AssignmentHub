import { upload, uploadToCloudinary } from "../middleware/upload.js";
import { createError } from "../utils/error.js";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, "No file provided"));
    }

    const result = await uploadToCloudinary(req.file.buffer, "assignmenthub");

    res.status(200).json({
      success: true,
      url: result.url,
      fileName: result.fileName,
      fileSize: result.fileSize,
    });
  } catch (error) {
    next(createError(500, "File upload failed: " + error.message));
  }
};
