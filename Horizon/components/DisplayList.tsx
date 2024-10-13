import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import DisplayHospitals from "./DisplayHospitals";
import DisplayShelters from "./DisplayShelters";

interface DisplayListProps {
  onClose: () => void;
}

const DisplayList: React.FC<DisplayListProps> = ({ onClose }) => {
  const [isDisplayHospital, setDisplayHospital] = useState(false);
  const [isDisplayShelter, setDisplayShelter] = useState(false);
  const [isDisplayBloodBank, setDisplayBloodBank] = useState(false);

  return (
    <View style={styles.listContainer}>
      <TouchableOpacity
        id="hospital"
        style={styles.iconButton}
        onPress={() => setDisplayHospital(true)}
      >
        <FontAwesome name="hospital-o" size={30} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        id="shelter"
        style={styles.iconButton}
        onPress={() => setDisplayShelter(true)}
      >
        <Ionicons name="home-outline" size={30} color="white" />
      </TouchableOpacity>

      <TouchableOpacity id="blood-banks" style={styles.iconButton}>
        <FontAwesome
          name="tint"
          size={30}
          color="white"
          onPress={() => setDisplayBloodBank(true)}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <MaterialIcons name="close" size={30} color="white" />
      </TouchableOpacity>

      {isDisplayHospital && (
        <DisplayHospitals onClose={() => setDisplayHospital(false)} />
      )}
      {isDisplayShelter && (
        <DisplayShelters onClose={() => setDisplayShelter(false)} />
      )}
      {isDisplayBloodBank && (
        <DisplayShelters onClose={() => setDisplayBloodBank(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#3b5998",
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    zIndex: 1002,
  },
  iconButton: {
    padding: 10,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    padding: 10,
  },
});

export default DisplayList;
