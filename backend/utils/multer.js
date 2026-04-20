import multer from "multer";
import { errorHandler } from "./error.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype?.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export const multerUploads = upload.array("image", 5);
export const multerMultipleUploads = multerUploads;

export const dataUri = (req) => {
  if (!req.files?.length) {
    return [];
  }

  return req.files.map((file) => {
    const base64 = Buffer.from(file.buffer).toString("base64");
    const mimeType = file.mimetype || "image/jpeg"; // Fallback to avoid Invalid image file error

    return {
      data: `data:${mimeType};base64,${base64}`,
      filename: file.originalname,
    };
  });
};
