const Laptop = require('../models/laptopModel');

exports.createLaptop = async (req, res) => {
  try {
    const { name, brand, price, stockQuantity } = req.body;
    const l = new Laptop({ name, brand, price, stockQuantity });
    await l.save();
    res.status(201).json(l);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLaptops = async (req, res) => {
  try {
    const laptops = await Laptop.find();
    res.json(laptops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
