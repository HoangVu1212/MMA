const Order = require('../models/orderModel');
const Laptop = require('../models/laptopModel');

exports.createOrder = async (req, res) => {
  try {
    const { laptopId, quantity } = req.body;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const laptop = await Laptop.findById(laptopId);
    if (!laptop) return res.status(404).json({ message: 'Laptop not found' });
    if (laptop.stockQuantity < quantity) return res.status(400).json({ message: 'Insufficient stock' });
    laptop.stockQuantity -= quantity;
    await laptop.save();
    const order = new Order({ user: userId, laptop: laptopId, quantity });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'username').populate('laptop', 'name brand price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
