import "../config/env.js";
import nodemailer from "nodemailer";

export const sendBookingEmail = async (toEmail, booking, vehicle) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email credentials are not configured");
  }

    const isProduction = process.env.NODE_ENV === "production";

    const transporter = nodemailer.createTransport(
      isProduction
        ? {
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
          }
        : {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
          }
    );

  const html = `
    <h2>Booking Confirmed</h2>
    <p>Booking ID: ${booking._id}</p>
    <p>Total Price: INR ${booking.totalPrice}</p>
    <p>Vehicle: ${vehicle.brand} ${vehicle.model}</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_HOST,
    to: toEmail,
    subject: "Booking Confirmation",
    html,
  });
};
