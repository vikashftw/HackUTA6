import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import EmergencyButton from './EmergencyCall';
import { LinearGradient } from 'expo-linear-gradient';

const Footer: React.FC = () => {
  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <TouchableOpacity style={styles.iconButton}>
        <FontAwesome name="search" size={34} color="white" />
      </TouchableOpacity>

      <View style={styles.emergencyButtonContainer}>
        <EmergencyButton />
      </View>

      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="person-circle" size={38} color="white" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 80,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: 'center',
    zIndex: 1001,
  },
});

export default Footer;