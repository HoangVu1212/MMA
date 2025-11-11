const express = require('express');
const router = express.Router();
const { createLaptop, getLaptops } = require('../controllers/laptopController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createLaptop);
router.get('/', verifyToken, getLaptops);

module.exports = router;
