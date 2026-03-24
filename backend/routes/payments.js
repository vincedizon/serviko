const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// GET /api/payments - Get my payments
router.get('/', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .populate('booking')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments - Create payment
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, method, transactionId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const payment = await Payment.create({
      booking: bookingId,
      customer: req.user._id,
      amount: booking.totalAmount,
      method,
      transactionId,
      status: 'completed',
      paidAt: new Date()
    });

    // Update booking payment status
    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });

    res.status(201).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
