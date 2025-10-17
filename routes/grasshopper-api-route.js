// routes/grasshopper-api-route.js
// Express router to interact with GraphHopper APIs (routing, isochrone, optimization, matrix).
// Requires: npm install express axios https body-parser

const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

// Use an HTTPS agent with keepAlive to reuse SSL/TLS sessions
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 10 });

// Base URL for GraphHopper API
const GH_BASE = 'https://graphhopper.com/api/1';

// Utility: Get API key (from env, query, or body)
function getApiKey(req) {
  return process.env.GRAPHHOPPER_API_KEY || req.query.key || req.body.key;
}

// Helper: Handle Axios errors
function handleAxiosError(res, err) {
  if (err.response) {
    return res.status(err.response.status).json({
      error: 'GraphHopper API error',
      status: err.response.status,
      data: err.response.data
    });
  } else {
    return res.status(500).json({ error: 'Request failed', message: err.message });
  }
}

/**
 * GET /api/graphhopper/route
 * Query params:
 *   - point=lat,lon&point=lat,lon  (min 2 points)
 *   - OR origin=lat,lon&destination=lat,lon
 *   - profile=car|bike|foot (default car)
 */
router.get('/route', async (req, res) => {
  try {
    const key = getApiKey(req);
    if (!key) return res.status(400).json({ error: 'Missing GraphHopper API key.' });

    let points = [];
    if (req.query.point) {
      points = Array.isArray(req.query.point) ? req.query.point : [req.query.point];
    } else if (req.query.origin && req.query.destination) {
      points = [req.query.origin, req.query.destination];
    } else {
      return res.status(400).json({
        error: 'Provide ?point=lat,lon (x2) or ?origin=lat,lon&destination=lat,lon'
      });
    }

    const profile = req.query.profile || 'car';
    const params = new URLSearchParams();
    points.forEach(p => params.append('point', p));
    params.set('profile', profile);
    params.set('points_encoded', 'true');
    params.set('instructions', req.query.instructions || 'true');
    params.set('locale', req.query.locale || 'en');
    params.set('key', key);

    const url = `${GH_BASE}/route?${params.toString()}`;
    const response = await axios.get(url, { httpsAgent, timeout: 20000 });

    const route = response.data.paths?.[0];
    if (!route) return res.status(500).json({ error: 'No route returned', data: response.data });

    const result = {
      distance_m: route.distance,
      time_ms: route.time,
      bbox: route.bbox,
      encoded_polyline: route.points,
      ascend_m: route.ascend,
      descend_m: route.descend,
      instructions: route.instructions || []
    };

    return res.json({ success: true, route: result });
  } catch (err) {
    return handleAxiosError(res, err);
  }
});

/**
 * GET /api/graphhopper/status
 * Simple health check
 */
router.get('/status', (req, res) => {
  res.json({ ok: true, message: 'GraphHopper proxy running fine.' });
});

module.exports = router;
