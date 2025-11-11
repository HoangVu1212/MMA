const Equipment = require("../models/equipmentModel");

// ➕ Tạo mới  (Admin)
exports.createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📋 Xem danh 
exports.getAllEquipment = async (req, res) => {
  try {
    const lots = await Equipment.find();
    res.json(lots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
