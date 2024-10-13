const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/nearby', async(req, res) => {
    const { latitude, longitude, radius = 25000 } = req.query;

    try {
        const overpassUrl = `https://overpass-api.de/api/interpreter`;
    
        const query = `
            [out:json][timeout:25];
            (
                node["amenity"="hospital"](around:${radius},${latitude},${longitude});
                node["amenity"="shelter"](around:${radius},${latitude},${longitude});
                node["healthcare"="blood_donation"](around:${radius},${latitude},${longitude});
            );
            out body;
        `;

        const response = await axios.post(overpassUrl, query);
        const locations = response.data.elements.map(element => ({
            id: element.id,
            type: element.tags.amenity || element.tags.healthcare,
            name: element.tags.name || 'Unknown',
            lat: element.lat,
            lon: element.lon
        }));

        res.json(locations);
    } catch (error) {
        console.error('Error fetching nearby locations:', error);
        res.status(500).json({ error: 'An error occurred fetching nearby locations' }); 
    }
});

module.exports = router;