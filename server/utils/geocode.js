const axios = require('axios');

const geocode = async (location) => {
  const encodedLocation = encodeURIComponent(location);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'GreenLog App'
    }
  });

  if (!response.data.length) {
    throw new Error(`No geolocation found for "${location}"`);
  }

  const { lat, lon } = response.data[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon) };
};

module.exports = geocode;
