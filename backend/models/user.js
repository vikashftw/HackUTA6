const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    healthInfo: {
        bloodType: String,
        allergies: [String],
        medications: [String],
        chronicConditions: [String],
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String
        }
    }
});

module.exports = mongoose.model('User', userSchema);