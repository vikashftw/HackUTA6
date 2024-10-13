import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
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
  const [travelTime, setTravelTime] = useState<string | null>("15");
  const [loading, setLoading] = useState<boolean>(true);
  const [arrivalTime, setArrivalTime] = useState<string | null>(null);

  useEffect(() => {
    const defaultDuration = 15 * 60;
    setTravelTime("15");
    calculateArrivalTime(defaultDuration);
    setLoading(false);
  }, [ems_name, latitude, longitude]);

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
      <View style={styles.timeContainer}>
        <Text style={styles.title}>Help is on the way from {ems_name}</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
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
  timeContainer: {
    padding: 20,
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
