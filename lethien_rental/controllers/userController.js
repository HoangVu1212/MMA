const User = require("../models/userModel");
const Rental = require("../models/rentalModel");

// 🧾 Lấy toàn bộ danh sách người dùng (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá người dùng (chỉ nếu không có rental active)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const activeRental = await Rental.find({ user: userId, status: "active" });

    if (activeRental.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete user with active rental." });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
