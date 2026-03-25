const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const VALID_SERVICES = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Aircon Technician',
  'House Cleaner', 'Welder', 'Pest Control', 'Landscaping', 'Tiling',
  'Masonry', 'Appliance Repair'
];

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, serviceType, city, rate } = req.body;
    console.log('Register payload:', req.body);
    // 1. Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // 2. Normalize role — User.js enum is ['customer', 'provider', 'admin']
    let normalizedRole = 'customer'; // ✅ default matches enum
    if (role === 'provider') normalizedRole = 'provider';
    if (role === 'admin')    normalizedRole = 'admin';

    // 3. Create the user
    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      phone,
      address: address || city
    });

    // 4. If provider, auto-create a Listing entry
    if (normalizedRole === 'provider') {
      try {
        const resolvedService = VALID_SERVICES.includes(serviceType) ? serviceType : null;

        if (!resolvedService) {
          console.warn('Provider registered without a valid service type:', serviceType);
        } else {
          await Listing.create({
            name:        user.name,
            userId:      user._id,
            service:     resolvedService,
            location:    city || address || 'Angeles City',
            rate:        Number(rate) || 0,
            rating:      0,
            verified:    false,
            description: `${user.name} is a registered provider on Serviko.`,
          });
        }
      } catch (listingErr) {
        console.error('Failed to create listing for provider:', listingErr.message);
      }
    }

    // 5. Generate token and respond
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/me
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;