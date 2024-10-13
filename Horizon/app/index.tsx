import React, { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import MapView, { Marker } from "react-native-maps";

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
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
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
          radius: 2500,
        }
      );
      setDisasters(response.data || []);
    } catch (error) {
      console.error("Error fetching disaster data:", error);
      Alert.alert("Error fetching disaster data. Please try again later.");
      setDisasters([]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {region && (
            <MapView style={{ width: "100%", height: "50%" }} region={region}>
              {disasters.map((disaster, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: disaster.coordinates[1],
                    longitude: disaster.coordinates[0],
                  }}
                  title={disaster.title}
                  description={`Type: ${disaster.type}, Date: ${new Date(
                    disaster.date
                  ).toLocaleString()}`}
                />
              ))}
            </MapView>
          )}
          <View style={{ flex: 1, padding: 20 }}>
            {location && (
              <Text>
                Latitude: {location.coords.latitude}, Longitude:{" "}
                {location.coords.longitude}
              </Text>
            )}
            <View style={{ marginTop: 20 }}>
              {disasters.length > 0 ? (
                disasters.map((disaster, index) => (
                  <View key={index} style={{ marginBottom: 15 }}>
                    <Text style={{ fontWeight: "bold" }}>{disaster.title}</Text>
                    <Text>Type: {disaster.type}</Text>
                    <Text>
                      Date: {new Date(disaster.date).toLocaleString()}
                    </Text>
                    <Text>Coordinates: {disaster.coordinates.join(", ")}</Text>
                  </View>
                ))
              ) : (
                <Text>No disasters found in your area.</Text>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
}
