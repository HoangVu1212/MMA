const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 🟢 Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Thiếu username hoặc password" });

    const exist = await User.findOne({ username });
    if (exist) return res.status(400).json({ message: "Username đã tồn tại" });

    const newUser = new User({ username, password });
    await newUser.save();

    console.log("✅ User registered:", newUser);
    res.status(201).json({
      message: "Đăng ký thành công",
      user: { _id: newUser._id, username: newUser.username },
    });
  } catch (err) {
    console.error("❌ Error register:", err.message);
    res.status(500).json({ message: "Lỗi server khi đăng ký" });
  }
});

// 🟢 Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Thiếu thông tin đăng nhập" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Không tìm thấy user" });

    if (user.password !== password)
      return res.status(400).json({ message: "Sai mật khẩu" });

    console.log("✅ User logged in:", user.username);
    res.json({
      message: "Đăng nhập thành công",
      _id: user._id,
      username: user.username,
    });
  } catch (err) {
    console.error("❌ Error login:", err.message);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
});

module.exports = router;
