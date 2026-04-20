import dotenv from "dotenv";
dotenv.config();

import { sendPasswordResetEmail } from "./services/emailService.js";

async function test() {
  console.log("Testing email with:");
  console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Set" : "Not Set");
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
  
  const result = await sendPasswordResetEmail("dev.nikk37@gmail.com", "http://localhost:5173/reset-password/test");
  
  console.log("Result:", result);
}

test();
