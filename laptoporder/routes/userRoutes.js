const express = require('express');
const router = express.Router();
const { getUsers, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getUsers);
router.delete('/:userId', verifyToken, deleteUser);

module.exports = router;
