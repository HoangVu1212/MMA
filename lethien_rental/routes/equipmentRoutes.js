const express = require("express");
const router = express.Router();
const {
  createEquipment,
  getAllEquipment,
} = require("../controllers/equipmentController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");

router.post("/", verifyToken, authorizeRole("admin"), createEquipment);
router.get("/", verifyToken, getAllEquipment);

module.exports = router;
