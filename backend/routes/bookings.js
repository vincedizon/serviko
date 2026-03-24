const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');
const auth    = require('../middleware/auth');


router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    const data = bookings.map(b => ({
      ...b.toObject(),
      id: b.ref
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.post('/', auth, async (req, res) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json({ success: true, data: booking, ref: booking.ref });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});


router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending bookings can be cancelled' });
    }
    booking.status = 'Cancelled';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;