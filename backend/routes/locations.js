const express = require('express');
const axios = require('axios');
const Client = require('../models/client');
const router = express.Router();


function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

router.get('/nearby', async (req, res) => {
    const { latitude, longitude, radius = 2500 } = req.query;
    const radiusInRadians = parseInt(radius) / 6371000;

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
            osmId: element.id,
            type: element.tags.amenity || element.tags.healthcare,
            name: element.tags.name || 'Unknown',
            lat: element.lat,
            lon: element.lon
        }));

        console.log('Fetched locations:', locations);

        
        const uniqueLocations = new Set(locations.map(loc => JSON.stringify(loc)));

        
        for (const location of locations) {
            if (location.name === 'Unknown') {
                console.log('Skipping unknown location:', location);
                continue;
            }
            try {
                const updatedClient = await Client.findOneAndUpdate(
                    { osmId: location.osmId },
                    {
                        name: location.name,
                        type: location.type,
                        location: {
                            type: 'Point',
                            coordinates: [location.lon, location.lat]
                        },
                        capacity: 100, 
                        specialties: [location.type], 
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                console.log('Updated/Created client:', updatedClient);
                
                uniqueLocations.add(JSON.stringify({
                    id: updatedClient._id, 
                    osmId: updatedClient.osmId,
                    type: updatedClient.type,
                    name: updatedClient.name,
                    lat: updatedClient.location.coordinates[1],
                    lon: updatedClient.location.coordinates[0]
                }));
            } catch (updateError) {
                console.error('Error updating/creating client:', updateError);
                console.error('Problematic location:', location);
            }
        }

        const allLocations = Array.from(uniqueLocations).map(locString => {
            const loc = JSON.parse(locString);
            return {
              id: loc._id || loc.id,
              osmId: loc.osmId,
              type: loc.type,
              name: loc.name,
              lat: loc.lat || (loc.location && loc.location.coordinates[1]),
              lon: loc.lon || (loc.location && loc.location.coordinates[0])
            };
          })
          .filter(loc=> loc.name != 'Unknown');

        const filteredLocations = allLocations.filter(loc => 
            calculateDistance(latitude, longitude, loc.lat, loc.lon) <= radius / 1000
        );

        res.json(filteredLocations);
    } catch (error) {
        console.error('Error in /nearby route:', error);
        res.status(500).json({ error: 'An error occurred fetching nearby locations' });
    }
});

module.exports = router;