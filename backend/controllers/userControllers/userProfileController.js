import User from "../../models/userModel.js";
import { isValidEmail, normalizeEmail, sanitizeUser } from "../../utils/auth.js";
import { errorHandler } from "../../utils/error.js";
import cloudinary from "../../utils/cloudinaryConfig.js";
import { dataUri } from "../../utils/multer.js";

export const editUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (req.user !== userId) {
      return next(errorHandler(403, "You can only update your own profile"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (req.body.username) {
      const username = req.body.username.trim();
      const existingUser = await User.findOne({
        username,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return next(errorHandler(409, "Username already in use"));
      }

      user.username = username;
    }

    if (req.body.email) {
      const email = normalizeEmail(req.body.email);

      if (!isValidEmail(email)) {
        return next(errorHandler(400, "Invalid email address"));
      }

      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return next(errorHandler(409, "Email already in use"));
      }

      user.email = email;
    }

    if (req.body.phoneNumber !== undefined) {
      user.phoneNumber = req.body.phoneNumber?.trim() || undefined;
    }

    if (req.body.address !== undefined) {
      user.address = req.body.address?.trim() || "";
    }

    if (req.files && req.files.length > 0) {
      const fileData = dataUri(req)[0];
      const result = await cloudinary.uploader.upload(fileData.data);
      user.profilePicture = result.secure_url;
    } else if (req.file) {
      // req.file fallback, but multerUploads uses array so req.files is populated
      const file = req.file;
      const base64 = Buffer.from(file.buffer).toString("base64");
      const mimeType = file.mimetype || "image/jpeg";
      const fileData = `data:${mimeType};base64,${base64}`;
      const result = await cloudinary.uploader.upload(fileData);
      user.profilePicture = result.secure_url;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};
