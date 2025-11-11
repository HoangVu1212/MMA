const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  difficulty: { type: String, default: "Easy" }, // 🟢 thêm độ khó
});

module.exports = mongoose.model("Task", taskSchema);
