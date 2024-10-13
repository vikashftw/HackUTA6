const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['individual', 'hospital', 'emergency_service'], required: true },
    medicalDetails: {
        bloodType: String,
        allergies: [String],
        medications: [String],
        emergencyContact: String
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    }
});

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);