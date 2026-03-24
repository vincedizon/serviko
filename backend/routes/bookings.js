const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// POST /api/bookings — create a new booking
// The model's pre('save') hook generates the ref (SK-XXXXX), so we do NOT generate it here.
router.post('/', protect, async (req, res) => {
  try {
    const {
      providerId,
      serviceId,
      scheduledDate,
      scheduledTime,
      address,
      notes,
      paymentMethod,
    } = req.body;

    const booking = await Booking.create({
      userId: req.user.id,
      providerId,
      serviceId,
      scheduledDate,
      scheduledTime,
      address,
      notes,
      paymentMethod,
      status: 'pending',
    });

    // Return both _id (needed by payment) and ref (human-readable)
    res.status(201).json({
      success: true,
      data: booking,
      _id: booking._id,
      ref: booking.ref,
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings — get all bookings for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('providerId', 'name avatar')
      .populate('serviceId', 'title price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id — get a SINGLE booking by its MongoDB _id
// BUG FIX: was using Booking.find({ userId }) instead of Booking.findById(req.params.id)
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('providerId', 'name avatar')
      .populate('serviceId', 'title price');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure only the owner (or admin) can view it
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/bookings/:id/status — update booking status (admin / provider)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;