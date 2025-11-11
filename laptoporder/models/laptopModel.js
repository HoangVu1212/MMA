const mongoose = require('mongoose');

const laptopSchema = new mongoose.Schema({
  name: String,
  brand: String,
  price: Number,
  stockQuantity: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Laptop', laptopSchema);
