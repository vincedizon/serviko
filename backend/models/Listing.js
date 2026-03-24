const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true
  },
  service: {
    type: String,
    required: [true, 'Service type is required'],
    enum: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Aircon Technician',
           'House Cleaner', 'Welder', 'Pest Control', 'Landscaping', 'Tiling',
           'Masonry', 'Appliance Repair']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  rate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);