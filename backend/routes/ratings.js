const express = require('express');
const router  = express.Router();
const Rating  = require('../models/Rating');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

// GET /api/ratings — Fetch all ratings
router.get('/', async (req, res) => {
  try {
    const allRatings = await Rating.find().sort({ createdAt: -1 });
    res.json({ success: true, data: allRatings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/ratings/listing/:id — Fetch ratings for a specific listing
router.get('/listing/:id', async (req, res) => {
  try {
    // ✅ Query Rating collection directly — not Booking
    const reviews = await Rating.find({ listingId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, listingId, rating, review, providerName, service } = req.body;

    // 1. Create the Rating with display fields for the Ratings Page
    const newRating = await Rating.create({
      bookingId,
      listingId,
      userId:       req.user._id,
      userName:     req.user.name,
      providerName: providerName, 
      service:      service,      
      rating:       Number(rating),
      review:       review
    });

    // 2. Mark the specific booking as 'rated' so the UI button updates
    const Booking = require('../models/Booking');
    await Booking.findByIdAndUpdate(bookingId, { rated: true });

    // 3. Update the Listing's average stars
    const Listing = require('../models/Listing');
    const allRatings = await Rating.find({ listingId });
    if (allRatings.length > 0) {
      const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      await Listing.findByIdAndUpdate(listingId, { rating: avg });
    }

    res.status(201).json({ success: true, data: newRating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;