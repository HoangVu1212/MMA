const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  sendOTP,
  verifyOTP
} = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateObjectId,
} = require("../middleware/validation");

// Auth routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);

// User profile routes
router.get("/:userId", validateObjectId("userId"), getProfile);
router.put("/:userId", validateObjectId("userId"), updateProfile);

// Password management routes
router.put("/change-password/:id", validateObjectId("id"), validatePasswordChange, changePassword);
router.post("/forgot-password", forgotPassword);

// OTP routes
router.post("/sendOTP", sendOTP); 
router.post("/verifyOTP", verifyOTP);

module.exports = router;
