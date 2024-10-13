import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";

interface DisplayListProps {
  onClose: () => void;
}

const DisplayList: React.FC<DisplayListProps> = ({ onClose }) => {
  return (
    <View style={styles.listContainer}>
      <TouchableOpacity style={styles.iconButton}>
        <FontAwesome name="hospital-o" size={30} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="home-outline" size={30} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton}>
        <FontAwesome name="user-secret" size={30} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <MaterialIcons name="local-police" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
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
