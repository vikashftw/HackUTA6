import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import MapView, { Marker } from "react-native-maps";
import Footer from "@/components/Footer";
import EmergencyButton from "@/components/EmergencyCall";

interface NearbyLocation {
  id?: string;
  osmId?: string;
  type: string;
  name: string;
  lat: number;
  lon: number;
}

interface Client {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  capacity: number;
  specialties: string[];
}

// Define the types for better TypeScript support
interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface Disaster {
  title: string;
  type: string;
  date: string;
  coordinates: number[];
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function Index() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [nearbyLocations, setNearbyLocations] = useState<NearbyLocation[]>([]);
  const [nearbyClients, setNearbyClients] = useState<Client[]>([]);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoading(true);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);

      setRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      if (userLocation) {
        fetchNearbyLocations(userLocation.coords.latitude, userLocation.coords.longitude);
        fetchNearbyClients(userLocation.coords.latitude, userLocation.coords.longitude);
      }
      fetchDisasterData(
        userLocation.coords.latitude,
        userLocation.coords.longitude
      );
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error getting location. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDisasterData = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.post(
        "http://100.83.200.110:3000/api/disasters/nearby-disasters",
        {
          latitude,
          longitude,
          radius: 50000,
        }
      );
      setDisasters(response.data || []);
    } catch (error) {
      console.error("Error fetching disaster data:", error);
      Alert.alert("Error fetching disaster data. Please try again later.");
      setDisasters([]);
    }
  };

  const fetchNearbyClients = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get("http://100.83.200.110:3000/api/clients/nearby", {
        params: { latitude, longitude, maxDistance: 250000 }
      });
      setNearbyClients(response.data);
    } catch (error) {
      console.error("Error fetching nearby clients:", error);
      Alert.alert("Error fetching nearby clients. Please try again later.");
    }
  };

  const fetchNearbyLocations = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get<NearbyLocation[]>("http://100.83.200.110:3000/api/locations/nearby", {
        params: { latitude, longitude, radius: 250000 }
      });
      setNearbyLocations(response.data);
    } catch (error) {
      console.error("Error fetching nearby locations:", error);
      Alert.alert("Error fetching nearby locations. Please try again later.");
    }
  };

  const getMarkerType = (type: string) => {
    switch (type) {
      case "hospital":
        return "Hospital";
      case "shelter":
        return "Shelter";
      case "Blood Bank and Donations":
        return "blue";
      default:
        return "Other EMS";
    }
  };

const handleEmergencyCall = async () => {
  if (nearbyClients.length === 0) {
    Alert.alert("No nearby emergency services found.");
    return;
  }

  const closestClient = nearbyClients[0];

  try {
    // Send alert to the closest client
    await axios.post("http://100.83.200.110:3000/api/clients/alert", {
      clientId: closestClient._id,
      location: {
        latitude: region?.latitude,
        longitude: region?.longitude
      }
    });

    Alert.alert(
      "Emergency Alert Sent",
      `Alert sent to ${closestClient.name}. They will contact you shortly.`
    );
  } catch (error) {
    console.error("Error sending emergency alert:", error);
    Alert.alert("Failed to send emergency alert. Please try again.");
  }
};

return (
  <View style={styles.container}>
    {loading ? (
      <ActivityIndicator size="large" color="#fff" />
    ) : (
      region && (
        <MapView
          style={styles.map}
          region={region}
        >
          {disasters.map((disaster, index) => (
            <Marker
              key={`disaster-${index}`}
              coordinate={{
                latitude: disaster.coordinates[1],
                longitude: disaster.coordinates[0],
              }}
              title={disaster.title}
              description={`Type: ${disaster.type}, Date: ${new Date(disaster.date).toLocaleString()}`}
              pinColor="yellow"
            />
          ))}
          {nearbyLocations.map((location, index) => (
            <Marker
              key={`location-${location.id || location.osmId || index}`}
              coordinate={{
                latitude: location.lat,
                longitude: location.lon,
              }}
              title={location.name}
              description={`Type: ${location.type}`}
              pinColor={getMarkerColor(location.type)}
            />
          ))}
        </MapView>
      )
    )}
    <EmergencyButton onEmergencyCall={handleEmergencyCall}/>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: Dimensions.get("window").height - 80,
  },
});
