import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from 'axios';
import { useUser } from './UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePage: React.FC<ProfilePageProps> = ({ goToRegister, goBackToMap }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await axios.post('http://100.83.200.110:3000/api/auth/login', {
        username: username.trim(),
        password: password.trim()
      });

      if (response.data && response.data.token) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        await AsyncStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        console.log('User logged in:', response.data.user);
        Alert.alert("Signed In", `Welcome back, ${username}!`, [
          { text: "OK", onPress: () => goBackToMap() }
        ]);
      } else {
        Alert.alert('Login Failed', 'Invalid response from server');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        Alert.alert('Login Failed', error.response.data.message || 'Invalid credentials');
      } else {
        Alert.alert('Login Failed', 'An unexpected error occurred');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };


return (
  <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradient}>
    <View style={styles.container}>
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
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      )}

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
    textShadowColor: "#000", // 3D shadow effect
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
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
    shadowColor: "#000", // Adding depth with shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10, // Adding depth
  },
  signInButton: {
    width: "100%",
    backgroundColor: "#4c669f",
    padding: 15,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    transform: [{ scale: 1.05 }], // Scale for 3D effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
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
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3, // 3D effect for the text
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default ProfilePage;