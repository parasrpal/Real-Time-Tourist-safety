const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['sos', 'unsafe_zone', 'warning_zone', 'fall_detected'],
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    accuracy: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'acknowledged', 'resolved'],
        default: 'pending'
    },
    emergencyContactsNotified: [{
        contactId: String,
        notifiedAt: Date
    }],
    message: String,
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    }
}, {
    timestamps: true
});

alertSchema.index({ location: '2dsphere' });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
