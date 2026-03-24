const express  = require('express');
const router   = express.Router();
const Payment  = require('../models/Payment');
const Booking  = require('../models/Booking');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, method, mobileNumber, bank, amount } = req.body;
    const ref = 'PAY-' + Math.floor(Math.random() * 90000 + 10000);
    const payment = await Payment.create({ ref, booking: bookingId||null, user: req.user.id, method, mobileNumber:mobileNumber||null, bank:bank||null, amount, status:'Held' });
    if (bookingId) await Booking.findByIdAndUpdate(bookingId, { status:'Active', payment: payment._id });
    res.status(201).json({ success:true, payment });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt:-1 }).populate('booking','service date status');
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', protect, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt:-1 }).populate('booking','service date').populate('user','name email');
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/release', protect, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status:'Released' }, { new:true });
    res.json(payment);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;