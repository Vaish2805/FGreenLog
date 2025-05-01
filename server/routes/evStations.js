const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    // Use the environment variable for the API key (ensure it's in your .env file as REACT_APP_OCM_API_KEY)
    const response = await axios.get('https://api.openchargemap.io/v3/poi/', {
      params: {
        output: 'json',
        latitude,
        longitude,
        distance: 10,
        distanceunit: 'KM',
        maxresults: 10,
      },
      headers: {
        'X-API-Key': process.env.REACT_APP_OCM_API_KEY, // Using the environment variable
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching EV stations:', error);
    res.status(500).json({ error: 'Failed to fetch EV stations' });
  }
});

module.exports = router;
