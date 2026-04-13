const express = require('express');
const Geofence = require('../models/Geofence');
const router = express.Router();

// @route   GET /api/geofences/nearby
// @desc    Find nearby geofences (for client-side checking)
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 1000 } = req.query; // radius in meters

        // Example predefined geofences around location
        const nearbyGeofences = await Geofence.find({
            isActive: true,
            coordinates: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius) * 1000 // MongoDB uses meters? Wait, actually radians but approx
                }
            }
        }).limit(10);

        res.json({
            success: true,
            geofences: nearbyGeofences.map(gf => ({
                _id: gf._id,
                type: gf.type,
                name: gf.name,
                coordinates: gf.coordinates
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/geofences/all
// @desc    Get all active geofences (admin)
router.get('/all', async (req, res) => {
    try {
        const geofences = await Geofence.find({ isActive: true });
        res.json({ success: true, geofences });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
