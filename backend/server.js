const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB Atlas')).catch(err => console.error('Could not connect to MongoDB Atlas', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    password: { type:String, required: true},
    medicalDetails: {
        bloodType: String,
        allergies: [String],
        medications: [String],
        emergencyContact: String
    }
});

const User = mongoose.model('User', userSchema);

app.post('/api/register', async (req, res) => {
    try {
        const {username, password, medicalDetails} = req.body;


    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    const user = new User({
        username,
        password: hashedpassword,
        medicalDetails
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });

    } catch(error){
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res)=> {
    try{
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });  
        }
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (error){
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

app.post('/api/nearby-disasters', async (req, res) => {
    const { latitude, longitude, radius = 20000 } = req.body;

    try {
        const disasters = await fetchNearbyDisasters(latitude, longitude, radius);
        res.json(disasters);
    } catch (error){
        console.error('Error in /api/nearby-disasters:', error);
        res.status(500).json({ error: 'An error occurred fetching disaster data'});
    }
});

async function fetchNearbyDisasters(latitude, longitude, radius) {
    try {
        const EONETdata = await fetchEONETData();
        console.log('Raw EONET data:', JSON.stringify(EONETdata, null, 2));
        const processedData = processEONETData(EONETdata);
        console.log('Processed data:', JSON.stringify(processedData, null, 2));
        if (processedData.length === 0) {
            console.log('No events found in the processed data.');
            return [];
        }
        const boundingBox = calculateBoundingBox(latitude, longitude, radius);
        console.log('Bounding box:', boundingBox);
        const filteredEvents = filterNearbyEvents(processedData, latitude, longitude, radius, boundingBox);
        console.log('Filtered events:', JSON.stringify(filteredEvents, null, 2));
        return filteredEvents;
    } catch (error) {
        console.error('Error in fetchNearbyDisasters:', error);
        throw error;
    }
}

async function fetchEONETData(){
    try{
        const response = await axios.get('https://eonet.gsfc.nasa.gov/api/v2.1/events?status=open&days=2');
        console.log('EONET API Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error fetching EONET data:', error);
        throw error;
    }
}

function processEONETData(data) {
    if (!data || !data.events || !Array.isArray(data.events)) {
        console.error('Unexpected data structure:', data);
        return [];
    }
    const processedEvents = data.events.map(event => {
        const latestGeometry = event.geometries.reduce((latest, current) => {
            return new Date(current.date) > new Date(latest.date) ? current : latest;
        });
        return {
            id: event.id,
            title: event.title,
            type: event.categories && event.categories[0] ? event.categories[0].title : 'Unknown',
            coordinates: latestGeometry.coordinates,
            date: new Date(latestGeometry.date),
            link: event.sources && event.sources[0] ? event.sources[0].url : null
        };
    }).filter(event => event.coordinates !== null);

    return combineSimilarEvents(processedEvents);
}

function calculateBoundingBox(lat, lon, radius) {
    const earthRadius = 6371; // km
    const latRadius = radius / earthRadius;
    const lonRadius = radius / (earthRadius * Math.cos(Math.PI * lat / 180));
    
    return {
        minLat: lat - latRadius * 180 / Math.PI,
        maxLat: lat + latRadius * 180 / Math.PI,
        minLon: lon - lonRadius * 180 / Math.PI,
        maxLon: lon + lonRadius * 180 / Math.PI
    };
}

function filterNearbyEvents(events, latitude, longitude, radius, boundingBox) {
    return events.filter(event => {
        const [eventLon, eventLat] = event.coordinates;
        if (eventLat < boundingBox.minLat || eventLat > boundingBox.maxLat ||
            eventLon < boundingBox.minLon || eventLon > boundingBox.maxLon) {
            return false;
        }
        const distance = calculateDistance(latitude, longitude, eventLat, eventLon);
        return distance <= radius;
    });
}

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

function combineSimilarEvents(events, distanceThreshold = 10) {
    const combinedEvents = [];

    events.forEach(event => {
        const matchingEvent = combinedEvents.find(combinedEvent => 
            combinedEvent.title === event.title &&
            combinedEvent.type === event.type &&
            calculateDistance(
                event.coordinates[1], event.coordinates[0],
                combinedEvent.coordinates[1], combinedEvent.coordinates[0]
            ) <= distanceThreshold
        );

        if (matchingEvent) {
            matchingEvent.occurrences.push({
                id: event.id,
                date: event.date,
                coordinates: event.coordinates,
                link: event.link
            });
        } else {
            combinedEvents.push({
                ...event,
                occurrences: [{
                    id: event.id,
                    date: event.date,
                    coordinates: event.coordinates,
                    link: event.link
                }]
            });
        }
    });

    return combinedEvents;
}

app.get('/test-nearby-disasters', async (req, res) => {
    const testLatitude = 36.2048;
    const testLongitude = 138.2529;
    const testRadius = 5000; // km
    try {
        const disasters = await fetchNearbyDisasters(testLatitude, testLongitude, testRadius);
        res.json({
            testCoordinates: { latitude: testLatitude, longitude: testLongitude, radius: testRadius },
            disastersFound: disasters.length,
            disasters: disasters
        });
    } catch (error) {
        console.error('Error in test endpoint:', error);
        res.status(500).json({ error: 'An error occurred fetching disaster data', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});