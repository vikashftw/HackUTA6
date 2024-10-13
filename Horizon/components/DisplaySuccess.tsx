import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";

interface DisplaySuccessProps {
  onClose: () => void;
  ems_name: string;
  latitude: number | undefined;
  longitude: number | undefined;
}

const DisplaySuccess: React.FC<DisplaySuccessProps> = ({
  onClose,
  ems_name,
  latitude,
  longitude,
}) => {
  const [travelTime, setTravelTime] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [arrivalTime, setArrivalTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchTravelTime = async () => {
      if (latitude && longitude) {
        try {
          const apiKey = "AIzaSyAJ3LGi3rxtn7vYFSJRIDuv8-4Q_s9LkeQ";
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/directions/json`,
            {
              params: {
                origin: `${latitude},${longitude}`,
                destination: ems_name,
                key: apiKey,
              },
            }
          );

          if (response.data.routes.length > 0) {
            const durationInSeconds =
              response.data.routes[0].legs[0].duration.value;
            const durationInMinutes = Math.ceil(durationInSeconds / 60);
            setTravelTime(durationInMinutes.toString());
            calculateArrivalTime(durationInSeconds);
          } else {
            const defaultDuration = 15 * 60;
            setTravelTime("15");
            calculateArrivalTime(defaultDuration);
          }
        } catch (error) {
          console.error("Error fetching travel time:", error);
          const defaultDuration = 15 * 60;
          setTravelTime("15");
          calculateArrivalTime(defaultDuration);
        } finally {
          setLoading(false);
        }
      } else {
        setTravelTime("Location not available");
        setLoading(false);
      }
    };

    fetchTravelTime();
  }, [ems_name, latitude, longitude]);

  // Calculate the estimated arrival time
  const calculateArrivalTime = (durationInSeconds: number) => {
    const now = new Date();
    const arrivalDate = new Date(now.getTime() + durationInSeconds * 1000);
    const hours = String(arrivalDate.getHours()).padStart(2, "0");
    const minutes = String(arrivalDate.getMinutes()).padStart(2, "0");
    setArrivalTime(`${hours}:${minutes}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <MaterialIcons name="close" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Help is on the way from {ems_name}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <>
          <Text style={styles.travelTime}>
            {travelTime
              ? `Estimated time of arrival: ${travelTime} minutes`
              : "No data"}
          </Text>
        </>
      )}
      {arrivalTime && (
        <Text style={styles.arrivalTime}>Arriving at: {arrivalTime}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    top: 40,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  travelTime: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  arrivalTime: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
});

export default DisplaySuccess;
