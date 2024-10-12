import React, { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location"; // For getting user location
import axios from "axios";

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

export default function Index() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading set to true

  useEffect(() => {
    getLocation();
  }, []);

  // Function to get user's location
  const getLocation = async () => {
    setLoading(true);

    // Ask for location permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      setLoading(false);
      return;
    }

    // Get user's location
    let userLocation = await Location.getCurrentPositionAsync({});
    setLocation(userLocation);

    // Send location data to backend
    fetchDisasterData(userLocation.coords.latitude, userLocation.coords.longitude);
  };

  // Function to fetch disaster data from the backend
  const fetchDisasterData = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.post("http://YOUR_BACKEND_SERVER_URL/api/nearby-disasters", {
        latitude,
        longitude,
        radius: 250, // Optional radius in km
      });
      setDisasters(response.data);
    } catch (error) {
      console.error("Error fetching disaster data:", error);
      Alert.alert("Error fetching disaster data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {location && (
            <Text>
              Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}
            </Text>
          )}
          <View style={{ marginTop: 20 }}>
            {disasters.length > 0 ? (
              disasters.map((disaster, index) => (
                <View key={index} style={{ marginBottom: 15 }}>
                  <Text style={{ fontWeight: "bold" }}>{disaster.title}</Text>
                  <Text>Type: {disaster.type}</Text>
                  <Text>Date: {new Date(disaster.date).toLocaleString()}</Text>
                  <Text>Coordinates: {disaster.coordinates.join(", ")}</Text>
                </View>
              ))
            ) : (
              <Text>No disasters found in your area.</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}
