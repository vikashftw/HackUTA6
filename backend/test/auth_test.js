const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const API_URL = 'http://localhost:3000/api';
let authToken = '';

const User = require('../models/user');
const Client = require('../models/client');

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function registerTestUser() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username: 'testuser',
      password: 'testpassword',
      userType: 'individual',
      healthInfo: {
        bloodType: 'A+',
        allergies: ['Peanuts'],
        medications: ['Aspirin'],
        emergencyContact: '123-456-7890'
      },
      location: {
        type: 'Point',
        coordinates: [-73.9857, 40.7484]
      }
    });
    console.log('Test user registered:', response.data);
  } catch (error) {
    console.error('Test user registration failed:', error.response ? error.response.data : error.message);
  }
}

async function login() {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: 'testuser',
        password: 'testpassword'
      });
      authToken = response.data.token;
      console.log('Logged in successfully');
      return authToken;
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
      }
      if (error.request) {
        console.error('Request:', error.request);
      }
    }
  }

async function registerClient(token) {
  try {
    const response = await axios.post(`${API_URL}/clients/register`, {
      name: "Test Hospital",
      location: {
        type: "Point",
        coordinates: [-73.9857, 40.7484]
      },
      capacity: 500,
      specialties: ["Emergency", "Surgery", "Pediatrics"]
    }, {
      headers: { 'x-auth-token': token }
    });
    console.log('Client registered:', response.data);
  } catch (error) {
    console.error('Client registration failed:', error.response ? error.response.data : error.message);
  }
}

async function getNearbyClients(token) {
  try {
    const response = await axios.get(`${API_URL}/clients/nearby`, {
      params: {
        latitude: 40.7128,
        longitude: -74.0060,
        maxDistance: 500
      },
      headers: { 'x-auth-token': token }
    });
    console.log('Nearby clients:', response.data);
  } catch (error) {
    console.error('Failed to get nearby clients:', error.response ? error.response.data : error.message);
  }
}

async function cleanup() {
    try {
      await User.deleteOne({ username: 'testuser' });
      await Client.deleteOne({ name: 'Test Hospital' });
      console.log('Cleanup completed');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

async function runTests() {
  await connectToDatabase();
  await registerTestUser();
  const token = await login();
  if (token) {
    await registerClient(token);
    await getNearbyClients(token);
  }
  await cleanup();
  await mongoose.connection.close();
}

runTests();