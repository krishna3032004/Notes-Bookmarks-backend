import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // ye file ke top me daal do


// temporary store OTPs in memory (for production, use Redis or DB)
const otpStore = {};

// nodemailer setup (Gmail example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ------------------ REGISTER FLOW ------------------

// Step 1: send OTP
export const sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, name, password };

    // send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Registration OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 2: verify OTP and create user
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otp || !email || !otpStore[email]) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (otpStore[email].otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // OTP correct → create user
    const hashedPassword = await bcrypt.hash(otpStore[email].password, 10);

    const user = await User.create({
      name: otpStore[email].name,
      email,
      password: hashedPassword,
    });

    delete otpStore[email]; // remove used OTP

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ LOGIN ------------------

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ FORGOT PASSWORD FLOW ------------------

// Step 1: send OTP
export const sendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp };
    console.log(otp)
    console.log(process.env.EMAIL_USER)
    console.log(process.env.EMAIL_PASS)

    const lg = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });
    console.log(otp)

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
};

// Step 2: verify OTP + new password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword || !otpStore[email]) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (otpStore[email].otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    delete otpStore[email]; // remove used OTP

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
