import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Alert, Dimensions } from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import MapView, { Marker } from "react-native-maps";
import Footer from "@/components/Footer";
import ProfilePage from "@/components/ProfilePage";
import RegisterPage from "@/components/RegisterPage";

// Interfaces for data structures
interface NearbyLocation {
  id?: string;
  osmId?: string;
  type: string;
  name: string;
  lat: number;
  lon: number;
}

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

const Index: React.FC = () => {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [nearbyLocations, setNearbyLocations] = useState<NearbyLocation[]>([]);
  const [currentPage, setCurrentPage] = useState<"map" | "profile" | "register">("map");

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        setLoading(false);
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);

      const regionData = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setRegion(regionData);
      fetchNearbyLocations(userLocation.coords.latitude, userLocation.coords.longitude);
      fetchDisasterData(userLocation.coords.latitude, userLocation.coords.longitude);
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
    }
  };

  const fetchNearbyLocations = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        "http://100.83.200.110:3000/api/locations/nearby",
        {
          params: { latitude, longitude, radius: 250000 },
        }
      );
      setNearbyLocations(response.data);
    } catch (error) {
      console.error("Error fetching nearby locations:", error);
      Alert.alert("Error fetching nearby locations. Please try again later.");
    }
  };

  const getMarkerType = (type: string): string => {
    switch (type) {
      case "hospital":
        return "Hospital";
      case "shelter":
        return "Shelter";
      case "blood_donation":
        return "Blood Bank and Donations";
      default:
        return "Other EMS";
    }
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case "hospital":
        return "red";
      case "shelter":
        return "green";
      case "blood_donation":
        return "blue";
      default:
        return "purple";
    }
  };

  const renderPage = () => {
    return (
      <>
        {currentPage === "map" && (
          <View style={styles.mapContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              region && (
                <MapView style={styles.map} region={region}>
                  {disasters.map((disaster, index) => (
                    <Marker
                      key={`disaster-${index}`}
                      coordinate={{
                        latitude: disaster.coordinates[1],
                        longitude: disaster.coordinates[0],
                      }}
                      title={disaster.title}
                      description={`Type: ${disaster.type}, Date: ${new Date(
                        disaster.date
                      ).toLocaleString()}`}
                      pinColor="yellow"
                    />
                  ))}
                  {nearbyLocations.map((location) => (
                    <Marker
                      key={`location-${location.id}`}
                      coordinate={{
                        latitude: location.lat,
                        longitude: location.lon,
                      }}
                      title={location.name}
                      description={`Service: ${getMarkerType(location.type)}`}
                      pinColor={getMarkerColor(location.type)}
                    />
                  ))}
                </MapView>
              )
            )}
            <Footer goToRegister={() => setCurrentPage("register")} />
          </View>
        )}

        {currentPage === "profile" && (
          <View style={styles.pageContainer}>
            <ProfilePage
              goToRegister={() => setCurrentPage("register")}
              goBackToMap={() => setCurrentPage("map")}
            />
          </View>
        )}

        {currentPage === "register" && (
          <View style={styles.pageContainer}>
            <RegisterPage goBackToProfile={() => setCurrentPage("profile")} />
          </View>
        )}
      </>
    );
  };

  return renderPage();
};
=======
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        region && (
          <MapView style={styles.map} region={region}>
            {disasters.map((disaster, index) => (
              <Marker
                key={`disaster-${index}`}
                coordinate={{
                  latitude: disaster.coordinates[1],
                  longitude: disaster.coordinates[0],
                }}
                title={disaster.title}
                description={`Type: ${disaster.type}, Date: ${new Date(
                  disaster.date
                ).toLocaleString()}`}
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
                description={`Service: ${getMarkerType(location.type)}`}
                pinColor={getMarkerColor(location.type)}
              />
            ))}
          </MapView>
        )
      )}
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: Dimensions.get("window").height - 80,
  },
  pageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
});

export default Index;
