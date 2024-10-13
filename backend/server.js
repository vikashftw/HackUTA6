const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/client');
const locationsRoutes = require('./routes/locations');
const disasterRoutes = require('./routes/disasters');
const clientRoutes = require('./routes/clients');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    await Client.init(); // This ensures indexes are created
    console.log('Client model initialized');
  })
  .catch(err => console.error('Could not connect to MongoDB Atlas', err));

app.use('/api/disasters', disasterRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/locations', locationsRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on PORT ${PORT}`);
});