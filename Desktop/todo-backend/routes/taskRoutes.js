const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// 🧪 Test route
router.get("/test", (req, res) => {
  console.log("✅ Test route called!");
  res.json({ message: "Backend hoạt động OK ✅" });
});

// 🟢 Lấy danh sách task theo user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err.message);
    res.status(500).json({ message: "Lỗi khi lấy danh sách task" });
  }
});

// 🟢 Thêm task mới
router.post("/", async (req, res) => {
  try {
    const { title, userId, difficulty } = req.body;
    if (!title || !userId)
      return res.status(400).json({ message: "Thiếu title hoặc userId" });

    const newTask = new Task({ title, userId, difficulty: difficulty || "Easy" });
    await newTask.save();
    console.log("✅ New task created:", newTask);
    res.status(201).json(newTask);
  } catch (err) {
    console.error("❌ Error creating task:", err.message);
    res.status(500).json({ message: "Lỗi khi tạo task mới" });
  }
});

// 🟢 Toggle hoàn thành task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Không tìm thấy task" });

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    console.error("❌ Error updating task:", err.message);
    res.status(500).json({ message: "Lỗi khi cập nhật task" });
  }
});

// 🟣 Sửa task (cập nhật title hoặc độ khó)
router.put("/:id/edit", async (req, res) => {
  try {
    const { title, difficulty } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, difficulty },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Không tìm thấy task" });

    console.log("📝 Task updated:", task);
    res.json(task);
  } catch (err) {
    console.error("❌ Error editing task:", err.message);
    res.status(500).json({ message: "Lỗi khi sửa task" });
  }
});

// 🟢 Xóa task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Không tìm thấy task" });

    res.json({ message: "Task deleted", id: req.params.id });
  } catch (err) {
    console.error("❌ Error deleting task:", err.message);
    res.status(500).json({ message: "Lỗi khi xóa task" });
  }
});

module.exports = router;
