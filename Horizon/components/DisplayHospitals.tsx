import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";

interface Hospital {
  id: number;
  name: string;
  distance: number;
  lat: number;
  lon: number;
}

interface DisplayHospitalsProps {
  onClose: () => void;
}

const DisplayHospitals: React.FC<DisplayHospitalsProps> = ({ onClose }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const getUserLocationAndFetchHospitals = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    };

    getUserLocationAndFetchHospitals();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchHospitals(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);

  const fetchHospitals = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        "http://100.83.200.110:3000/api/locations/nearby",
        {
          params: { latitude, longitude, radius: 250000 },
        }
      );

      const hospitalsData = response.data.filter(
        (location: any) => location.type === "hospital"
      );
      setHospitals(hospitalsData);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Hospital }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.distance}>{item.distance} km</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation ? userLocation.latitude : 37.78825,
          longitude: userLocation ? userLocation.longitude : -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            coordinate={{
              latitude: hospital.lat,
              longitude: hospital.lon,
            }}
            title={hospital.name}
            description={`${hospital.distance} km away`}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={hospitals}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#3b5998",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  closeText: {
    color: "white",
  },
  item: {
    marginVertical: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  distance: {
    fontSize: 14,
    color: "#666",
  },
  listContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    maxHeight: "50%",
  },
});

export default DisplayHospitals;
