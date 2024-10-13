import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const DisasterMap = () => {
  const [region, setRegion] = useState(null);
  const [disasters, setDisasters] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      fetchDisasters(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchDisasters = async (latitude, longitude) => {
    try {
      const response = await axios.post('http://100.83.200.110/api/disasters/nearby-disasters', {
        latitude,
        longitude,
        radius: 2500 // adjust as needed
      });
      setDisasters(response.data);
    } catch (error) {
      console.error('Error fetching disaster data:', error);
    }
  };

  if (!region) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {disasters.map((disaster, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: disaster.coordinates[1],
              longitude: disaster.coordinates[0],
            }}
            title={disaster.title}
            description={`Type: ${disaster.type}, Date: ${new Date(disaster.date).toLocaleDateString()}`}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default DisasterMap;