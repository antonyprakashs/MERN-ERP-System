const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.post('/register', validate('register'), registerUser);
router.post('/login', validate('login'), loginUser);
router.get('/me', protect, getMe);

module.exports = router;
