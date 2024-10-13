import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface DisplayProfileProps {
  setDisplayProfile: (value: boolean) => void;
  goToRegister: () => void; 
}

const DisplayProfile: React.FC<DisplayProfileProps> = ({ setDisplayProfile, goToRegister }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSignIn = () => {
    Alert.alert("Signed In", `Welcome back, ${username}!`);
    setDisplayProfile(false);
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => setDisplayProfile(false)}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    width: "100%",
    height: "100%",
  },
  container: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    color: "#fff",
    fontSize: 16,
  },
  signInButton: {
    width: "100%",
    backgroundColor: "#4c669f",
    padding: 15,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  registerSection: {
    flexDirection: "row",
    marginTop: 15,
  },
  registerText: {
    color: "#aaa",
  },
  registerLink: {
    color: "#4c669f",
    marginLeft: 5,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 10,
  },
});

export default DisplayProfile;
