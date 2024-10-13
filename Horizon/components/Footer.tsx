import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import EmergencyButton from "./EmergencyCall";
import { LinearGradient } from "expo-linear-gradient";
import DisplayList from "./DisplayList";
import axios from "axios";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
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

const Footer: React.FC = () => {
  const [isDisplayList, setDisplayList] = useState(false);
  const [nearbyClients, setNearbyClients] = useState<Client[]>([]);
  const [region, setRegion] = useState<Region | undefined>(undefined);

  const fetchNearbyClients = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        "http://100.83.200.110:3000/api/clients/nearby",
        {
          params: { latitude, longitude, maxDistance: 250000 },
        }
      );
      setNearbyClients(response.data);
    } catch (error) {
      console.error("Error fetching nearby clients:", error);
      Alert.alert("Error fetching nearby clients. Please try again later.");
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
          longitude: region?.longitude,
        },
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
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <TouchableOpacity
        id="search-icon"
        style={styles.iconButton}
        onPress={() => setDisplayList(true)}
      >
        <FontAwesome name="search" size={34} color="white" />
      </TouchableOpacity>

      <View style={styles.emergencyButtonContainer}>
        <EmergencyButton onEmergencyCall={handleEmergencyCall} />
      </View>

      <TouchableOpacity id="profile-icon" style={styles.iconButton}>
        <Ionicons name="person-circle" size={38} color="white" />
      </TouchableOpacity>

      {isDisplayList && <DisplayList onClose={() => setDisplayList(false)} />}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 80,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  iconButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: "center",
    zIndex: 1001,
  },
});

export default Footer;
