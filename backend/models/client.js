const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    osmId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    capacity: { type: Number, required: true },
    specialties: [String],
    activeAlerts: [{
        location: {
            type: { type: String, default: 'Point' },
            coordinates: [Number]
        },
        timestamp: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'accepted', 'resolved'], default: 'pending' }
    }]
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

clientSchema.pre('save', function(next) {
    if (this.location && this.location.coordinates) {
        const [lon, lat] = this.location.coordinates;
        if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
            return next(new Error('Invalid coordinates'));
        }
    }
    next();
});

module.exports = mongoose.model('Client', clientSchema);