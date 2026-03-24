const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt:-1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;