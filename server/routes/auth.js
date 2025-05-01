const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Register route (already implemented)
router.post('/register', register);

// Login route (new route)
router.post('/login', login);

module.exports = router;
