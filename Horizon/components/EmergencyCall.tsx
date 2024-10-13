// EmergencyButton.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface EmergencyButtonProps {
  onEmergencyCall: () => void;
}

export default function EmergencyButton({ onEmergencyCall }: EmergencyButtonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.emergencyButton} onPress={onEmergencyCall}>
        <Text style={styles.buttonText}>Emergency Call</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles for the emergency button and container
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyButton: {
    width: 250,
    height: 60,
    backgroundColor: "#ff4b5c", // A striking red for the button
    borderRadius: 15, // Curved edges
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.46,
    shadowRadius: 11.14,
    elevation: 17, // 3D shadow effect
    borderWidth: 2,
    borderColor: "#ff858d", // Subtle border
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    textTransform: "uppercase",
  },
});