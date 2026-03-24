const express = require('express');
const router  = express.Router();
const Rating  = require('../models/Rating');
const { protect } = require('../middleware/auth');


router.get('/', async (req, res) => {
  try {
    const ratings = await Rating.find()
      .sort({ createdAt: -1 })
      .populate('user',    'name')
      .populate('listing', 'title category providerName');
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/listing/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({ listing: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name');
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', protect, async (req, res) => {
  try {
    const { listing, booking, rating, comment } = req.body;
    const review = await Rating.create({
      user: req.user.id,
      listing,
      booking: booking || null,
      rating,
      comment,
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;