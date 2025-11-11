const express = require("express");
const router = express.Router();
const perfumeController = require("../controllers/productController");
const { validateProduct } = require("../middleware/validation");

router.get("/", perfumeController.getAllPerfumes);
router.get("/:id", perfumeController.getPerfumeById);
router.post("/", validateProduct, perfumeController.createPerfume);
router.put("/:id", validateProduct, perfumeController.updatePerfume);
router.delete("/:id", perfumeController.deletePerfume);

module.exports = router;
