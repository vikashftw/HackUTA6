const axios = require('axios');
const xml2js = require('xml2js');

async function fetchNearbyDisasters(latitude, longitude, radius) {
    try {
        const [EONETdata, GDACSdata] = await Promise.all([
            fetchEONETData(),
            fetchGDACSData()
        ]);

        
        console.log('Raw EONET data:', JSON.stringify(EONETdata, null, 2));
        console.log('Raw GDACS data:', JSON.stringify(GDACSdata, null, 2));


        const processedEONETData = processEONETData(EONETdata);
        const processedGDACSData = processGDACSData(GDACSdata);

        const allProcessedData = [...processedEONETData, ...processedGDACSData];
        console.log('All processed data:', JSON.stringify(allProcessedData, null, 2));


        if (allProcessedData.length === 0) {
            console.log('No events found in the processed data.');
            return [];
        }

        const deduplicatedData = removeDuplicates(allProcessedData);
        console.log('Deduplicated data:', JSON.stringify(deduplicatedData, null, 2));

        const boundingBox = calculateBoundingBox(latitude, longitude, radius);
        console.log('Bounding box:', boundingBox);


        const filteredEvents = filterNearbyEvents(deduplicatedData, latitude, longitude, radius, boundingBox);
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

async function fetchGDACSData() {
    try {
        const response = await axios.get('https://www.gdacs.org/xml/rss.xml');
        const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
        const result = await parser.parseStringPromise(response.data);
        const items = result.rss.channel.item;
        return Array.isArray(items) ? items : [items]; // Ensure we always return an array
    } catch (error) {
        console.error('Error fetching GDACS data:', error);
        throw error;
    }
}

function processGDACSData(data) {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    return data
        .filter(item => new Date(item.pubDate) >= twoDaysAgo)
        .map(item => {
            let lat = null;
            let lon = null;

            // Check different possible structures for coordinates
            if (item['geo:Point'] && item['geo:Point']['geo:lat'] && item['geo:Point']['geo:long']) {
                lat = parseFloat(item['geo:Point']['geo:lat']);
                lon = parseFloat(item['geo:Point']['geo:long']);
            } else if (item['georss:point']) {
                const [latStr, lonStr] = item['georss:point'].split(' ');
                lat = parseFloat(latStr);
                lon = parseFloat(lonStr);
            }

            return {
                id: item.guid ? (item.guid._ || item.guid) : null,
                title: item.title,
                type: item['dc:subject'] || 'Unknown',
                coordinates: [lon, lat], // GeoJSON format
                date: new Date(item.pubDate),
                link: item.link,
                description: item.description,
                alertLevel: item['gdacs:alertlevel'] || null,
                country: item['gdacs:country'] || null
            };
        })
        .filter(event => event.coordinates[0] !== null && event.coordinates[1] !== null);
}


function removeDuplicates(events) {
    const uniqueEvents = {};
    events.forEach(event => {
        const key = `${event.type}-${Math.round(event.coordinates[1] * 100) / 100}-${Math.round(event.coordinates[0] * 100) / 100}`;
        if (!uniqueEvents[key] || event.date > uniqueEvents[key].date) {
            uniqueEvents[key] = event;
        }
    });
    return Object.values(uniqueEvents);
}


module.exports = {
    fetchNearbyDisasters,
    fetchEONETData,
    fetchGDACSData,
    processEONETData,
    processGDACSData,
    calculateBoundingBox,
    filterNearbyEvents,
    calculateDistance,
    removeDuplicates
};