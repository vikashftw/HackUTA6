const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const disasterRoutes = require('./routes/disasters');
const clientRoutes = require('./routes/clients');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas', err));

app.use('/api/auth', authRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/clients', clientRoutes);

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});