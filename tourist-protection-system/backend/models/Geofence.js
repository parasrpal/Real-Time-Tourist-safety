const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['safe', 'warning', 'unsafe'],
        required: true
    },
    city: String,
    country: String,
    coordinates: {
        type: [{
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        }],
        required: true,
        minItems: 3
    },
    radius: {
        type: Number,
        default: 100 // meters
    },
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

geofenceSchema.index({ coordinates: '2dsphere' });
geofenceSchema.index({ city: 1, type: 1 });
geofenceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Geofence', geofenceSchema);
