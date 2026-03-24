const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

// POST /api/ratings — submit a rating after a completed booking
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'bookingId and rating are required' });
    }

    // 1. Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Guard: only the owner of the booking can rate it
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Guard: prevent double-rating
    if (booking.rated) {
      return res.status(400).json({ success: false, message: 'Already rated' });
    }

    // 2. Mark booking as rated
    booking.rated   = true;
    booking.rating  = rating;
    booking.review  = review || '';
    await booking.save();

    // 3. Recalculate the listing's average rating
    const allRatedBookings = await Booking.find({
      listingId: booking.listingId,
      rated: true
    }).select('rating');

    const avg = allRatedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / allRatedBookings.length;

    await Listing.findByIdAndUpdate(booking.listingId, {
      rating: Math.round(avg * 10) / 10  // round to 1 decimal
    });

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;