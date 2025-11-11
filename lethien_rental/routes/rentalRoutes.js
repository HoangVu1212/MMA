const express = require("express");
const router = express.Router();
const {
  bookRental,
  endRental,
  getRental,
  searchRentalByDate,
} = require("../controllers/rentalController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, bookRental);
router.patch("/:id/end", verifyToken, endRental);
router.get("/", verifyToken, getRental);
router.get("/search/date", verifyToken, searchRentalByDate);

module.exports = router;
