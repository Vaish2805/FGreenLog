// server.js
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Import Routes
const authRoutes        = require('./routes/auth');
const recommendRoutes   = require('./routes/recommend');   // GET /api/recommend
const evStationsRoutes  = require('./routes/evStations');  // POST /api/ev-stations

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', recommendRoutes);           // GET  /api/recommend
app.use('/api/ev-stations', evStationsRoutes); // POST /api/ev-stations

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
