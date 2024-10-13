import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ProfilePageProps {
  goToRegister: () => void;
  goBackToMap: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  goToRegister,
  goBackToMap,
}) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSignIn = () => {
    Alert.alert("Signed In", `Welcome back, ${username}!`);
    goBackToMap();
  };

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Ensure all text is inside a <Text> component */}
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

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          {/* Text must be wrapped inside <Text> */}
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Register Section */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>

        {/* Go Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={goBackToMap}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1, // Ensure the gradient covers the entire screen
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    flex: 1, // Allow the container to fill the available space
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

export default ProfilePage;
