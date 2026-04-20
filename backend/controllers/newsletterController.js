import Newsletter from "../models/newsletterModel.js";
import { isValidEmail, normalizeEmail } from "../utils/auth.js";
import { errorHandler } from "../utils/error.js";
import { sendNewsletterWelcomeEmail } from "../services/emailService.js";

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return next(errorHandler(400, "Please provide a valid email address"));
    }

    const existingSubscriber = await Newsletter.findOne({ email: normalizedEmail });

    if (existingSubscriber) {
      return res.status(200).json({ success: true, message: "You are already subscribed!" });
    }

    const newSubscriber = new Newsletter({ email: normalizedEmail });
    await newSubscriber.save();

    // Send welcome email asynchronously
    sendNewsletterWelcomeEmail(normalizedEmail).catch((error) => {
      console.error("Failed to send newsletter welcome email:", error);
    });

    return res.status(201).json({ success: true, message: "Successfully subscribed to our newsletter!" });
  } catch (error) {
    next(error);
  }
};
