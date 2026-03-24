const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  ref:          { type: String, required: true, unique: true },
  booking:      { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method:       { type: String, enum: ['gcash', 'maya', 'bank'], required: true },
  mobileNumber: { type: String, default: null },
  bank:         { type: String, default: null },
  amount:       { type: Number, required: true },
  status:       { type: String, enum: ['Pending', 'Held', 'Released', 'Disputed'], default: 'Held' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);