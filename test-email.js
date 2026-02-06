import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // load .env file

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // tumhara gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // apna email khud test ke liye
      subject: "Test Email from Node",
      text: "Hello! Ye email test ke liye hai.",
    });
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

sendTestEmail();
