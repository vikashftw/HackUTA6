import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
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
          // Replace with your Google Maps API Key
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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Travel Time to {ems_name}</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Text style={{ fontSize: 16 }}>
          {travelTime ? `Estimated travel time: ${travelTime}` : "No data"}
        </Text>
      )}
      <Button title="Close" onPress={onClose} />
    </View>
  );
};

export default DisplaySuccess;
