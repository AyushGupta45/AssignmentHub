import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { createError } from "../utils/error.js";

// Multer with memory storage, 10MB limit
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

// Upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, folder = "assignmenthub") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          fileName: result.original_filename + "." + result.format,
          fileSize: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
};
