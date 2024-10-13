import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

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
            const duration = response.data.routes[0].legs[0].duration.text;
            setTravelTime(duration);
          } else {
            setTravelTime("No route found");
          }
        } catch (error) {
          console.error("Error fetching travel time:", error);
          setTravelTime("Error fetching travel time");
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Travel Time to {ems_name}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <Text style={styles.travelTime}>
          {travelTime ? `Estimated travel time: ${travelTime}` : "No data"}
        </Text>
      )}
      <View style={styles.closeButtonContainer}>
        <Button title="Close" onPress={onClose} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    height: 300, // You can adjust the height as necessary
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  travelTime: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  closeButtonContainer: {
    marginTop: 20,
  },
});

export default DisplaySuccess;
