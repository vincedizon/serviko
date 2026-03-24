const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { protect, authorize } = require('../middleware/auth');

// GET /api/bookings - Get my bookings
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') query.customer = req.user._id;
    else if (req.user.role === 'provider') query.provider = req.user._id;
    // admin sees all

    const bookings = await Booking.find(query)
      .populate('listing', 'title category price')
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/bookings - Create booking (customer only)
router.post('/', protect, authorize('customer', 'admin'), async (req, res) => {
  try {
    const { listingId, scheduledDate, scheduledTime, address, notes } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const booking = await Booking.create({
      listing: listingId,
      customer: req.user._id,
      provider: listing.provider,
      scheduledDate,
      scheduledTime,
      address,
      notes,
      totalAmount: listing.price
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/bookings/:id/status - Update booking status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
