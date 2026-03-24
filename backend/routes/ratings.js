const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

// GET /api/ratings/listing/:listingId
router.get('/listing/:listingId', async (req, res) => {
  try {
    const ratings = await Rating.find({ listing: req.params.listingId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: ratings.length, ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ratings - Submit a rating
router.post('/', protect, async (req, res) => {
  try {
    const { listingId, bookingId, score, comment } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const existing = await Rating.findOne({ booking: bookingId, customer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already rated this booking' });

    const rating = await Rating.create({
      listing: listingId,
      booking: bookingId,
      customer: req.user._id,
      provider: listing.provider,
      score,
      comment
    });

    // Update listing average rating
    const allRatings = await Rating.find({ listing: listingId });
    const avg = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
    await Listing.findByIdAndUpdate(listingId, {
      rating: Math.round(avg * 10) / 10,
      totalRatings: allRatings.length
    });

    res.status(201).json({ success: true, rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
