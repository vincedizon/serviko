const express  = require('express');
const router   = express.Router();
const Listing  = require('../models/Listing');
const { protect } = require('../middleware/auth');

// GET /api/listings — fetch all with optional filters
router.get('/', async (req, res) => {
  try {
    const { search, category, minRating, maxRate, verified, sortBy } = req.query;
    let query = {};

    if (category)            query.service = { $regex: new RegExp(category, 'i') };
    if (verified === 'true') query.verified = true;
    if (minRating)           query.rating   = { $gte: parseFloat(minRating) };
    if (maxRate)             query.rate     = { $lte: parseFloat(maxRate) };

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { service:     { $regex: search, $options: 'i' } },
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

// GET /api/listings/categories — count per category
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

// GET /api/listings/mine — get the logged-in provider's own listing
router.get('/mine', protect, async (req, res) => {
  try {
    const listing = await Listing.findOne({ userId: req.user._id });
    if (!listing) return res.status(404).json({ success: false, message: 'No listing found for this provider' });
    res.json({ success: true, data: listing });
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
    const { rate, service, city, description } = req.body;

    // ← UPDATED: validate that rate is provided and is a positive number
    if (!rate || isNaN(rate) || Number(rate) < 100) {
      return res.status(400).json({ success: false, message: 'A valid hourly rate (minimum ₱100) is required.' });
    }

    const listing = await Listing.create({
      ...req.body,
      userId: req.user.id,
      rate:   Number(rate),   // ← ensure it's stored as a number
    });

    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/listings/mine — provider updates their own listing (rate, description, location)
router.patch('/mine', protect, async (req, res) => {
  try {
    const { rate, description, location } = req.body;

    const updates = {};
    if (rate        !== undefined) updates.rate        = Number(rate);
    if (description !== undefined) updates.description = description;
    if (location    !== undefined) updates.location    = location;

    const listing = await Listing.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/listings/:id — admin update (verify, suspend, update rating)
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