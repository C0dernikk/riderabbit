import { sendContactEmail } from "../services/emailService.js";

export const submitContactForm = async (req, res, next) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const fullName = `${firstName} ${lastName}`;
    const result = await sendContactEmail(fullName, email, message);

    if (result.success) {
      return res.status(200).json({ success: true, message: "Message sent successfully!" });
    } else {
      return res.status(500).json({ success: false, message: "Failed to send message", error: result.error });
    }
  } catch (error) {
    next(error);
  }
};
