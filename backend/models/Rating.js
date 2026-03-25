const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  bookingId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  listingId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:     { type: String },
  providerName: { type: String },   // ← was missing, needed for ratings page display
  service:      { type: String },   // ← was missing, needed for ratings page display
  providerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating:       { type: Number, required: true, min: 1, max: 5 },
  review:       { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);