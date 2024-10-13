import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import EmergencyButton from "./EmergencyCall";
import { LinearGradient } from "expo-linear-gradient";
import DisplayProfile from "./DisplayProfile";

interface FooterProps {
  goToRegister: () => void; // Add this prop to handle registration navigation
}

const Footer: React.FC<FooterProps> = ({ goToRegister }) => {
  const [isDisplayProfile, setDisplayProfile] = useState(false);

  return (
    <>
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.container}>
        <TouchableOpacity id="search-icon" style={styles.iconButton}>
          <FontAwesome name="search" size={34} color="white" />
        </TouchableOpacity>

        <View style={styles.emergencyButtonContainer}>
          <EmergencyButton />
        </View>

        <TouchableOpacity
          id="profile-icon"
          style={styles.iconButton}
          onPress={() => setDisplayProfile(true)}
        >
          <Ionicons name="person-circle" size={38} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Display Profile Page over the whole screen */}
      {isDisplayProfile && (
        <View style={styles.overlayContainer}>
          <DisplayProfile
            setDisplayProfile={setDisplayProfile}
            goToRegister={goToRegister} // Pass the navigation function to go to register
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 80,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
  },
  emergencyButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: "center",
    zIndex: 1001,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    zIndex: 2000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});

export default Footer;
