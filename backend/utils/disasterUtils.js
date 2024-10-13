const axios = require('axios');

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

async function fetchEONETData() {
    try {
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
    const R = 6371; // Earth's radius in km
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

module.exports = {
    fetchNearbyDisasters,
    fetchEONETData,
    processEONETData,
    calculateBoundingBox,
    filterNearbyEvents,
    calculateDistance,
    combineSimilarEvents
};