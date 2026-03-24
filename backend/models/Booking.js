const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  
  ref: {
    type: String,
    unique: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  service:    { type: String, required: true },
  provider:   { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  
  description: String,
  address:     String,
  city:        { type: String, default: 'Angeles City' },
  duration:    String,
  date:        { type: Date, required: true },
  time:        String,
  urgency:     String,
  contactName: String,
  phone:       String,
  notes:       String,

  amount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed', 'Cancelled'],
    default: 'Pending'
  },

  rated: { type: Boolean, default: false }

}, { timestamps: true });


bookingSchema.pre('save', async function (next) {
  if (!this.ref) {
    const num = Math.floor(Math.random() * 90000 + 10000);
    this.ref = 'SK-' + num;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);