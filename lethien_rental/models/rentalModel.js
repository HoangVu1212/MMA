const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment" },
  startDate: Date,
  quantity: Number,
  status: { type: String, enum: ["active", "completed"], default: "active" },
  
depositFee: Number,
  bookedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Rental", rentalSchema);
