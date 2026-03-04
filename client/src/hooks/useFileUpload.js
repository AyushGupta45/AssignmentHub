import { useState, useCallback } from "react";
import api from "@/lib/api";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });

      setFileUrl(res.data.url);
      setFileName(res.data.fileName);
      setFileSize(res.data.fileSize);
      setIsUploading(false);
      setProgress(100);

      return {
        url: res.data.url,
        fileName: res.data.fileName,
        fileSize: res.data.fileSize,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Upload failed";
      setError(message);
      setIsUploading(false);
      setProgress(0);
      throw new Error(message);
    }
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setFileUrl(null);
    setFileName(null);
    setFileSize(null);
    setError(null);
  }, []);

  return { upload, isUploading, progress, fileUrl, fileName, fileSize, error, reset };
}
