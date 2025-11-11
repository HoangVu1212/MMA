const User = require('../models/userModel');
const Order = require('../models/orderModel');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const hasOrders = await Order.exists({ user: userId });
    if (hasOrders) return res.status(400).json({ message: 'Cannot delete users with existing orders.' });
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
