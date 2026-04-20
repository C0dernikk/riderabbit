import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "dev.nikk37@gmail.com";
const FROM_EMAIL = process.env.EMAIL_FROM || "RideRabit <noreply@resend.dev>";

export const sendContactEmail = async (name, email, message) => {
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured. Email not sent.");
    return { success: false, error: "Email service not configured" };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Message via RideRabit Contact Form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });
    if (error) {
      console.error("Resend API Error sending contact email:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Resend Error sending contact email:", err);
    return { success: false, error: err.message };
  }
};

export const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  if (!resend) return { success: false, error: "Email service not configured" };
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: `Booking Confirmation - ${bookingDetails.vehicleName}`,
      html: `
        <h2>Your Booking is Confirmed!</h2>
        <p>Thank you for choosing RideRabit. Your booking for <strong>${bookingDetails.vehicleName}</strong> is confirmed.</p>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
          <li><strong>Start Date:</strong> ${new Date(bookingDetails.startDate).toLocaleDateString()}</li>
          <li><strong>End Date:</strong> ${new Date(bookingDetails.endDate).toLocaleDateString()}</li>
          <li><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount}</li>
        </ul>
        <p>You can view your booking details in your dashboard.</p>
      `,
    });
    if (error) {
      console.error("Resend API Error sending booking confirmation:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Resend Error sending booking confirmation:", err);
    return { success: false, error: err.message };
  }
};

export const sendVendorBookingAlert = async (vendorEmail, bookingDetails) => {
  if (!resend) return { success: false, error: "Email service not configured" };
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [vendorEmail],
      subject: `New Booking Alert - ${bookingDetails.vehicleName}`,
      html: `
        <h2>You have a new booking!</h2>
        <p>Your vehicle <strong>${bookingDetails.vehicleName}</strong> has been booked.</p>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
          <li><strong>Start Date:</strong> ${new Date(bookingDetails.startDate).toLocaleDateString()}</li>
          <li><strong>End Date:</strong> ${new Date(bookingDetails.endDate).toLocaleDateString()}</li>
          <li><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount}</li>
        </ul>
        <p>Please check your vendor dashboard for more details.</p>
      `,
    });
    if (error) {
      console.error("Resend API Error sending vendor alert:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Resend Error sending vendor alert:", err);
    return { success: false, error: err.message };
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!resend) return { success: false, error: "Email service not configured" };
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "RideRabit Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });
    if (error) {
      console.error("Resend API Error sending password reset:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Resend Error sending password reset:", err);
    return { success: false, error: err.message };
  }
};

export const sendTripReceipt = async (userEmail, vendorEmail, adminEmail, tripDetails) => {
  if (!resend) return { success: false, error: "Email service not configured" };
  
  const receiptHtml = `
    <h2>Trip Receipt - RideRabit</h2>
    <p>The trip for <strong>${tripDetails.vehicleName}</strong> has been completed successfully.</p>
    <h3>Receipt Details:</h3>
    <ul>
      <li><strong>Booking ID:</strong> ${tripDetails.bookingId}</li>
      <li><strong>Completed On:</strong> ${new Date().toLocaleDateString()}</li>
      <li><strong>Total Paid:</strong> ₹${tripDetails.totalAmount}</li>
      <li><strong>Vendor Earned:</strong> ₹${tripDetails.vendorAmount}</li>
      <li><strong>Admin Commission:</strong> ₹${tripDetails.adminAmount}</li>
    </ul>
    <p>Thank you for using RideRabit.</p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail, vendorEmail, adminEmail], // Send to all 3
      subject: `Trip Receipt - ${tripDetails.bookingId}`,
      html: receiptHtml,
    });
    if (error) {
      console.error("Resend API Error sending trip receipt:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Resend Error sending trip receipt:", err);
    return { success: false, error: err.message };
  }
};

export const sendNewsletterWelcomeEmail = async (email) => {
  if (!resend) return { success: false, error: "Email service not configured" };
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Welcome to RideRabit Newsletter!",
      html: `
        <h2>Welcome to the RideRabit Community!</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You'll now be the first to know about our latest updates, exclusive offers, and travel tips.</p>
        <p>Stay tuned for more!</p>
        <br/>
        <p>Best regards,</p>
        <p>The RideRabit Team</p>
      `,
    });
    if (error) {
      console.error("Resend API Error sending newsletter welcome:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Resend Error sending newsletter welcome:", err);
    return { success: false, error: err.message };
  }
};
