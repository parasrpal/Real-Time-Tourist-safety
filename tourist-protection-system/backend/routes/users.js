const express = require('express');
const User = require('../models/User');
const router = express.Router();

// @route   POST /api/users/:id/location
// @desc    Update user location
router.post('/:id/location', async (req, res) => {
    try {
        const { lat, lng, accuracy } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                lastLocation: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Location updated',
            location: user.lastLocation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/:id
// @desc    Get user profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
