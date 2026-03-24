const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// POST /api/bookings — create a booking
router.post('/', protect, async (req, res) => {
  try {
    const ref = 'SK-' + Math.floor(Math.random() * 90000 + 10000);
    const booking = await Booking.create({
      ...req.body,
      ref,
      user: req.user.id,
      status: 'Pending',
    });
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/bookings — admin: all bookings | user: own bookings
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('listing', 'title category providerName');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('listing', 'title category providerName');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/bookings/:id — update status (cancel, complete, etc.)
router.patch('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;