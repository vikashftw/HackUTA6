const express = require('express');
const { fetchNearbyDisasters } = require('../utils/disasterUtils');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/nearby-disasters', async (req, res) => {
    const { latitude, longitude, radius = 50000 } = req.body;

    try {
        const disasters = await fetchNearbyDisasters(latitude, longitude, radius);
        res.json(disasters);
    } catch (error) {
        console.error('Error in /api/disasters/nearby:', error);
        res.status(500).json({ error: 'An error occurred fetching disaster data' });
    }
});

module.exports = router;