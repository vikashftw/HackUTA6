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

interface Hospital {
  id: number;
  name: string | null; // Allow null for name
  distance: number | null; // Allow null for distance
}

interface DisplayHospitalsProps {
  onClose: () => void;
}

const DisplayHospitals: React.FC<DisplayHospitalsProps> = ({ onClose }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

      setHospitals(hospitalsData.slice(0, 15));
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Hospital }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name ? item.name : "EMS"}</Text>
      <Text style={styles.distance}>
        {item.distance !== null ? `${item.distance} km` : "N/A"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <FlatList
          data={hospitals}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#3b5998",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  closeText: {
    color: "white",
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
    alignItems: "center",
  },
  item: {
    marginVertical: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    width: "100%",
    maxWidth: 400,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  distance: {
    fontSize: 14,
    color: "#666",
  },
});

export default DisplayHospitals;
