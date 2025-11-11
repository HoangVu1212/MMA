const Rental = require("../models/rentalModel");
const Equipment = require("../models/equipmentModel");

// 📥 Đặt vé 
exports.bookRental = async (req, res) => {
  try {
    const { equipmentId, startDate, endDate, quantity } = req.body;
    const userId = req.user.id;

    const lot = await Equipment.findById(equipmentId);
    if (!lot) return res.status(404).json({ message: "Equipment not found" });

    if (lot.stockQuantity <= 0)
      return res.status(400).json({ message: "No available equipment." });

    lot.stockQuantity -= 1;
    await lot.save();

    const rental = await Rental.create({
      equipment: lot._id,
      startDate,
      quantity,
      status: "active",
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧾 Kết thúc vé đỗ xe
exports.endRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate("equipment");
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    if (rental.status === "completed")
      return res.status(400).json({ message: "Rental already completed" });

    trental.status = "completed";
    rental.totalFee =
      rental.equipment.pricePerDay * rental.depositFee || 0;
    await rental.save();

    // cập nhật lại slot
    const lot = await Equipment.findById(rental.equipment._id);
    lot.stockQuantity += 1;
    await lot.save();

    res.json({ message: "Rental session ended", rental });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Xem danh sách vé
exports.getRental = async (req, res) => {
  try {
    const filter =
      req.user.role === "customer" ? { user: req.user.id } : {};

    const rental = await Rental.find(filter)
      .populate("user", "username role")
      .populate("equipment");
    res.json(rental);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Tìm vé theo khoảng ngày
exports.searchRentalByDate = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate))
      return res.status(400).json({ message: "Invalid date range." });

    const filter =
      req.user.role === "customer" ? { user: req.user.id } : {};

    const rental = await Rental.find({
      ...filter,
      bookedAt: { $gte: startDate, $lte: endDate },
    }).populate("equipment");

    res.json(rental);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
