const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

// ─── IMPORTANT: /my must be declared BEFORE /:id ─────────────────────────────
// If /:id is first, Express will treat "my" as an ID and crash.

// GET /api/bookings/my — logged-in user's bookings only
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking
      .find({ userId: req.user.id })
      .populate('listingId') // fills in provider details
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings — admin: all bookings
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking
      .find()
      .populate('userId',    'name email')
      .populate('listingId', 'name service rate')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings — create a booking
router.post('/', protect, async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      userId: req.user.id,
      status: 'Pending',
      rated:  false,
    };
    const booking = await Booking.create(bookingData);

    // Generate a human-friendly reference  e.g.  SK-A3F2C
    const ref = `SK-${booking._id.toString().slice(-5).toUpperCase()}`;

    res.status(201).json({ success: true, data: booking, ref });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id — single booking detail
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking
      .find({ userId: req.user.id })
      .populate({ 
      path: 'listingId',
      strictPopulate: false});

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id/cancel — cancel a booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/bookings/:id — general update (admin: change status, etc.)
router.patch('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;