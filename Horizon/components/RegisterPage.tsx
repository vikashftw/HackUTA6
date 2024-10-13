import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import axios from 'axios';
import { useUser } from './UserContext';

const RegisterPage: React.FC<{ goBackToProfile: () => void }> = ({ goBackToProfile }) => {
  const { setUser } = useUser();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const handleNextStep = () => {
    if (username && password) {
      setStep(2);
    } else {
      Alert.alert('Missing Information', 'Please enter both username and password.');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://100.83.200.110:3000/api/auth/register', {
        username,
        password,
        healthInfo: {
          bloodType,
          allergies: allergies.split(',').map(item => item.trim()),
          medications: medications.split(',').map(item => item.trim()),
          chronicConditions: chronicConditions.split(',').map(item => item.trim()),
          emergencyContact: {
            name: emergencyContactName,
            relationship: emergencyContactRelationship,
            phone: emergencyContactPhone
          }
        }
      });

      if (response.data.user) {
        setUser(response.data.user);
        Alert.alert('Registration Successful', 'You have been registered and logged in.');
        goBackToProfile();
      }
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      Alert.alert('Registration Failed', `Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 ? (
        <>
          <Text style={styles.title}>Create Account</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Next" onPress={handleNextStep} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Medical Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Blood Type"
            value={bloodType}
            onChangeText={setBloodType}
          />
          <TextInput
            style={styles.input}
            placeholder="Allergies (comma separated)"
            value={allergies}
            onChangeText={setAllergies}
          />
          <TextInput
            style={styles.input}
            placeholder="Medications (comma separated)"
            value={medications}
            onChangeText={setMedications}
          />
          <TextInput
            style={styles.input}
            placeholder="Chronic Conditions (comma separated)"
            value={chronicConditions}
            onChangeText={setChronicConditions}
          />
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact Name"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
          />
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact Relationship"
            value={emergencyContactRelationship}
            onChangeText={setEmergencyContactRelationship}
          />
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact Phone"
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
          />
          <Button title="Register" onPress={handleRegister} />
        </>
      )}
      <Button title="Back to Profile" onPress={goBackToProfile} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default RegisterPage;