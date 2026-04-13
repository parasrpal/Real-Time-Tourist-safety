const express = require('express');
const Alert = require('../models/Alert');
const router = express.Router();

// @route   POST /api/alerts/sos
// @desc    Create SOS alert
router.post('/sos', async (req, res) => {
    try {
        const { userId, location, accuracy, message } = req.body;

        const alert = new Alert({
            userId,
            type: 'sos',
            location,
            accuracy,
            message: message || 'Emergency SOS - Help needed immediately!',
            severity: 'critical'
        });

        await alert.save();

        res.status(201).json({
            success: true,
            alert: alert._id,
            message: 'SOS alert created and sent to emergency contacts'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/alerts/:userId
// @desc    Get user alerts
router.get('/:userId', async (req, res) => {
    try {
        const alerts = await Alert.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('userId', 'name phone');

        res.json({ success: true, alerts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/alerts/:id/acknowledge
// @desc    Acknowledge alert
router.put('/:id/acknowledge', async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status: 'acknowledged' },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        res.json({ success: true, alert });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
