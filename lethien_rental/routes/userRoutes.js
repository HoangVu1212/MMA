const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser } = require("../controllers/userController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", verifyToken, authorizeRole("admin"), getAllUsers);
router.delete("/:id", verifyToken, authorizeRole("admin"), deleteUser);

module.exports = router;
