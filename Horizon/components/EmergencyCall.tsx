import React from 'react';
import { TouchableOpacity, Text, Linking, StyleSheet } from 'react-native';

const EmergencyButton: React.FC = () => {
  const handleEmergencyCall = () => {
    Linking.openURL("tel:911");
  };

  return (
    <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
      <Text style={styles.buttonText}>SOS</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  emergencyButton: {
    backgroundColor: "#ff4b5c",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#ff858d",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    textTransform: "uppercase",
  },
});

export default EmergencyButton;