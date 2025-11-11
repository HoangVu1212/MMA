const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: String,
  category: String,
  pricePerDay: Number,
  depositFee: Number,
  stockQuantity: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Equipment", equipmentSchema);
