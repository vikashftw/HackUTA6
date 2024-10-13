const express = require('express');
const Client = require('../models/client');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, location, capacity, specialties } = req.body;

        const client = new Client({
            name,
            location,
            capacity,
            specialties
        });

        await client.save();
        res.status(201).json({ message: 'Client registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/nearby', async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 10000 } = req.query;

        const clients = await Client.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        });

        res.json(clients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/alert', async (req, res) => {
    try {
        const { clientId, location } = req.body;

        console.log(`Emergency alert for client ${clientId} at location:`, location);

        res.status(200).json({ message: 'Alert sent successfully' });
    } catch (error) {
        console.error('Error sending alert:', error);
        res.status(500).json({ message: 'Server error' });       
    }
});


module.exports = router;