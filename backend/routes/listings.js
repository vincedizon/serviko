const express = require('express');
const router  = express.Router();
const Listing = require('../models/Listing');
const auth    = require('../middleware/auth');

// GET /api/listings — fetch all with optional filters
router.get('/', async (req, res) => {
  try {
    const { search, category, minRating, maxRate, verified, sortBy } = req.query;

    let query = {};

    if (category)  query.service  = category;
    if (verified === 'true') query.verified = true;
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (maxRate)   query.rate   = { ...query.rate, $lte: parseFloat(maxRate) };

    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } },
      ];
    }

    let sort = {};
    if (sortBy === 'rating') sort = { rating: -1 };
    else if (sortBy === 'rate') sort = { rate: 1 };
    else if (sortBy === 'name') sort = { name: 1 };
    else sort = { rating: -1 }; // default

    const listings = await Listing.find(query).sort(sort);
    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/listings/categories — get count per service category
router.get('/categories', async (req, res) => {
  try {
    const counts = await Listing.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort:  { count: -1 } }
    ]);
    res.json({ success: true, data: counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/listings/:id — single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/listings — create listing (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const listing = await Listing.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/listings/:id — update listing (auth required)
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/listings/:id — delete listing (auth required)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;