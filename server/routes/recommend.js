// server/routes/recommend.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// DB connection
const db = require('../config/db');

// Haversine helper
function toRad(deg) {
  return deg * Math.PI / 180;
}
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Geocode via Nominatim
async function geocode(address) {
  const res = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: address, format: 'json', limit: 1 }
  });
  if (!res.data.length) throw new Error(`Cannot geocode "${address}"`);
  return {
    lat: parseFloat(res.data[0].lat),
    lon: parseFloat(res.data[0].lon)
  };
}

// POST /api/recommend
router.post('/recommend', async (req, res) => {
  try {
    const { source, destination, load } = req.body;
    if (!source || !destination || !load) {
      return res.status(400).json({ error: 'Source, destination & load required' });
    }

    // a) Geocode
    const [src, dst] = await Promise.all([
      geocode(source),
      geocode(destination)
    ]);

    // b) Distance
    const distance = haversine(src.lat, src.lon, dst.lat, dst.lon);

    // c) Load‑filtered vehicles
    const sql = `
      SELECT * 
      FROM vehicles 
      WHERE min_load_capacity <= ? 
        AND max_load_capacity >= ?
    `;
    db.query(sql, [load, load], (err, rows) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'DB query failed' });
      }
      if (!rows.length) {
        return res.json({ distance: distance.toFixed(2), vehicles: [] });
      }

      // d) Compute per‐vehicle metrics
      const DIESEL_BASE_PER_KM = 0.35; // baseline diesel kg CO₂/km
      const recs = rows.map(v => {
        // your table uses `type` = 'EV' or 'Diesel'
        const isEV = v.type === 'EV';
        const perKm = v.co2_emission;              // from your table
        // EV total saving vs baseline
        const carbonSaved = isEV
          ? (DIESEL_BASE_PER_KM - perKm) * distance
          : 0;
        // total trip emissions
        const totalEmissions = perKm * distance;
        return {
          name: v.name,
          fuel_type: v.type,                       // for front‑end display
          carbonSaved: parseFloat(carbonSaved.toFixed(2)),
          totalEmissions: parseFloat(totalEmissions.toFixed(2)),
          evStation: isEV ? 'Show on map' : null
        };
      });

      // e) Build final list: EVs first (by highest savings), then diesel (by lowest emissions)
      const evs     = recs.filter(r => r.carbonSaved > 0)
                          .sort((a,b) => b.carbonSaved - a.carbonSaved);
      const diesels = recs.filter(r => r.carbonSaved === 0)
                          .sort((a,b) => a.totalEmissions - b.totalEmissions);

      // take up to 3, but at least 2 if possible
      const combined = [...evs, ...diesels].slice(0, 3);

      return res.json({
        distance: distance.toFixed(2),
        vehicles: combined
      });
    });

  } catch (error) {
    console.error('Recommend route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
