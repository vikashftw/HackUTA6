const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    capacity: { type: Number, required: true },
    specialties: [String]
});

clientSchema.index({ location: '2dsphere' });

clientSchema.statics.findNearby = function(coords, maxDistance) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: coords
                },
                $maxDistance: maxDistance
            }
        }
    });
};

module.exports = mongoose.model('Client', clientSchema);