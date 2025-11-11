const { AppError } = require("./errorHandler");

/**
 * Validation middleware for user registration
 */
const validateRegister = (req, res, next) => {
  const { name, email, phone, dob, password } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Invalid email format");
  }

  // Phone validation (Vietnamese format)
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phone || !phoneRegex.test(phone)) {
    errors.push("Invalid phone number format");
  }

  // Date of birth validation
  if (!dob) {
    errors.push("Date of birth is required");
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(", "), 400));
  }

  next();
};

/**
 * Validation middleware for user login
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Invalid email format");
  }

  // Password validation
  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(", "), 400));
  }

  next();
};

/**
 * Validation middleware for password change
 */
const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push("Current password is required");
  }

  if (!newPassword || newPassword.length < 6) {
    errors.push("New password must be at least 6 characters");
  }

  if (currentPassword === newPassword) {
    errors.push("New password must be different from current password");
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(", "), 400));
  }

  next();
};

/**
 * Validation middleware for product creation/update
 */
const validateProduct = (req, res, next) => {
  const { name, price, stock, quantity } = req.body;
  const errors = [];

  if (name !== undefined && (!name || name.trim().length < 2)) {
    errors.push("Product name must be at least 2 characters");
  }

  if (price !== undefined && (isNaN(price) || price < 0)) {
    errors.push("Price must be a non-negative number");
  }

  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    errors.push("Stock must be a non-negative number");
  }

  if (quantity !== undefined && (isNaN(quantity) || quantity < 0)) {
    errors.push("Quantity must be a non-negative number");
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(", "), 400));
  }

  next();
};

/**
 * Validation middleware for MongoDB ObjectId
 */
const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!id || !objectIdRegex.test(id)) {
    return next(new AppError("Invalid ID format", 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProduct,
  validateObjectId,
};

