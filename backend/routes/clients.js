const express = require('express');
const Client = require('../models/client');
const axios = require('axios');
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
        const { clientId, location, userInfo } = req.body;

        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const newAlert = {
            location: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
            },
            timestamp: new Date(),
            status: 'pending',
            userInfo: userInfo ? {
                name: userInfo.name,
                healthInfo: userInfo.healthInfo
            } : null
        };

        client.activeAlerts.push(newAlert);
        await client.save();

        console.log(`Emergency alert created for client ${client.name}:`, newAlert);
        res.status(200).json({ message: 'Alert created successfully', alertId: newAlert._id });
    } catch (error) {
        console.error('Error sending alert:', error);
        res.status(500).json({ message: 'Server error' });       
    }
});

router.get('/active-alerts', async (req, res) => {
    console.log('Received request for active alerts');
    try {
      const activeAlerts = await Client.aggregate([
        { $match: { 'activeAlerts.status': 'pending' } },
        { $project: {
          name: 1,
          activeAlerts: {
            $filter: {
              input: '$activeAlerts',
              as: 'alert',
              cond: { $eq: ['$$alert.status', 'pending'] }
            }
          }
        }}
      ]);
      console.log('Active alerts from database:', JSON.stringify(activeAlerts, null, 2));
      res.json(activeAlerts);
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

router.post('/resolve-alert', async (req, res) => {
    try {
        const { clientId, alertId } = req.body;
        const result = await Client.updateOne(
            { _id: clientId, "activeAlerts._id": alertId },
            { $set: { "activeAlerts.$.status": "resolved" } }
        );
        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Alert resolved successfully' });
        } else {
            res.status(404).json({ message: 'Alert not found or already resolved' });
        }
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;