import express from "express";
import {
  login,
  sendRegisterOtp,
  verifyRegisterOtp,
  sendForgotOtp,
  resetPassword
} from "../controllers/authController.js";

const router = express.Router();


router.post("/register", sendRegisterOtp);        // Step 1: send OTP to email
router.post("/register/verify", verifyRegisterOtp); // Step 2: verify OTP and create user

// LOGIN
router.post("/login", login);

// FORGOT PASSWORD FLOW
router.post("/forgot-password", sendForgotOtp);      // Step 1: send OTP
router.post("/reset-password", resetPassword);      // Step 2: verify OTP and update password

// router.post("/register", register);
// router.post("/login", login);

export default router;
