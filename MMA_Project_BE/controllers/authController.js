require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");


const registerUser = async (req, res) => {
  const { name, email, phone, dob, password, address, avatar } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userData = { name, email, phone, dob, password };
    if (address !== undefined) userData.address = address;
    if (avatar) userData.avatar = avatar;

    const user = new User(userData);
    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      avatar: user.avatar,
      address: user.address || "",
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      avatar: user.avatar,
      address: user.address || "",
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password -otp -otpExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      avatar: user.avatar,
      address: user.address || "",
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone, dob, avatar, address } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields only if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (avatar !== undefined) user.avatar = avatar;
    if (address !== undefined) user.address = address;

    await user.save();
    
    res.status(200).json({ 
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        avatar: user.avatar,
        address: user.address || "",
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });

    user.password = newPassword;  // Không hash ở đây!
    await user.save();  // Middleware sẽ tự hash

    res.status(200).json({ message: "Mật khẩu đã được cập nhật" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const forgotPassword = async (req, res) => {
  const { email, phone, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    // Kiểm tra email có tồn tại không
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    // Kiểm tra số điện thoại có khớp với email trong database không
    if (user.phone !== phone) {
      return res.status(404).json({ message: "Số điện thoại không khớp với email" });
    }

    // Kiểm tra OTP có tồn tại không
    if (!user.otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }

    // Kiểm tra OTP có đúng không
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    // Cập nhật mật khẩu và xóa OTP sau khi đổi mật khẩu thành công
    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};





// Cấu hình mail server
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Chỉ đặt true nếu dùng port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false });
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã OTP Đặt Lại Mật Khẩu",
      text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
    });

    res.status(200).json({ message: "OTP đã được gửi" });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }
    if (user.otp !== otp) return res.status(400).json({ message: "OTP không chính xác" });

    await user.save();
    res.json({ message: "Xác thực OTP thành công" });
  } catch (error) {
    console.error("Lỗi verifyOTP:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};








module.exports = { registerUser, loginUser, getProfile, updateProfile, changePassword, forgotPassword,sendOTP,verifyOTP };
