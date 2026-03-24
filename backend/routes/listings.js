const express  = require('express');
const router   = express.Router();
const Listing  = require('../models/Listing');
const { protect } = require('../middleware/auth');

// GET /api/listings — fetch all with optional filters
router.get('/', async (req, res) => {
  try {
    const { search, category, minRating, maxRate, verified, sortBy } = req.query;
    let query = {};

    // FIX: Schema uses 'service', not 'category'
    if (category)            query.service = { $regex: new RegExp(category, 'i') };
    if (verified === 'true') query.verified = true;
    if (minRating)           query.rating   = { $gte: parseFloat(minRating) };
    if (maxRate)             query.rate     = { $lte: parseFloat(maxRate) };

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } }, // FIX: 'name' not 'providerName'
        { service:     { $regex: search, $options: 'i' } }, // FIX: 'service' not 'category'
        { description: { $regex: search, $options: 'i' } },
        { location:    { $regex: search, $options: 'i' } },
      ];
    }

    let sort = {};
    if      (sortBy === 'rating') sort = { rating: -1 };
    else if (sortBy === 'rate')   sort = { rate:    1 };
    else if (sortBy === 'name')   sort = { name:    1 };
    else                          sort = { rating: -1 };

    const listings = await Listing.find(query).sort(sort);
    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/listings/categories — count per category (for filter sidebar)
router.get('/categories', async (req, res) => {
  try {
    const counts = await Listing.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } }, // FIX: '$service' not '$category'
      { $sort:  { count: -1 } }
    ]);
    res.json({ success: true, data: counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/listings/:id — single listing detail
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('userId', 'name email');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/listings — create listing (requires login)
router.post('/', protect, async (req, res) => {
  try {
    const listing = await Listing.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/listings/:id — partial update (admin: verify, suspend, update rating)
router.patch('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;