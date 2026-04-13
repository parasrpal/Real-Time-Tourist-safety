const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        required: true
    },
    emergencyContacts: [{
        name: String,
        phone: String,
        email: String
    }],
    languages: [{
        type: String,
        enum: ['en', 'es', 'fr', 'de', 'it']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            index: '2dsphere'
        }
    }
}, {
    timestamps: true
});

userSchema.index({ lastLocation: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
