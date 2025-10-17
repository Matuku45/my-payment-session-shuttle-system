/**
 * Express router to simulate GraphHopper routing
 * - Supports full CRUD for dummy routes
 * - Integrates optional GraphHopper live API if key is provided
 */

const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 10 });
const GH_BASE = 'https://graphhopper.com/api/1';

// Dummy in-memory storage for routes
let dummyRoutes = [];

/** Utility: generate route ID */
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

/** Utility: get API key */
function getApiKey(req) {
  return process.env.GRAPHHOPPER_API_KEY || req.query.key || req.body.key;
}

/** Helper: handle axios errors */
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
 * @swagger
 * tags:
 *   - name: GraphHopper
 *     description: Routing, isochrones, matrix, and dummy routes
 */

/** ✅ GET ALL ROUTES */
router.get('/routes', (req, res) => {
  res.json({ success: true, count: dummyRoutes.length, routes: dummyRoutes });
});

/** ✅ GET ONE ROUTE BY ID */
router.get('/route/:id', (req, res) => {
  const route = dummyRoutes.find(r => r.id === req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json({ success: true, route });
});

/** ✅ GET ROUTE (LIVE OR DUMMY) */
router.get('/route', async (req, res) => {
  try {
    const key = getApiKey(req);

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

    // Dummy route
    const dummyRoute = {
      id: generateId(),
      points,
      profile: req.query.profile || 'car',
      instructions: [
        { text: 'Start at origin', distance: 0 },
        { text: 'Follow main road', distance: 200 },
        { text: 'Turn left', distance: 500 },
        { text: 'Arrive at destination', distance: 1000 }
      ],
      distance_m: 1200,
      time_ms: 600000,
      encoded_polyline: 'mock_encoded_polyline_123',
      ascend_m: 10,
      descend_m: 8,
      timestamp: new Date()
    };
    dummyRoutes.push(dummyRoute);

    // Fetch live route if API key available
    if (key) {
      const params = new URLSearchParams();
      points.forEach(p => params.append('point', p));
      params.set('profile', req.query.profile || 'car');
      params.set('points_encoded', 'true');
      params.set('instructions', 'true');
      params.set('locale', req.query.locale || 'en');
      params.set('key', key);

      const url = `${GH_BASE}/route?${params.toString()}`;
      const response = await axios.get(url, { httpsAgent, timeout: 20000 });
      const route = response.data.paths?.[0];

      if (route) {
        const liveRoute = {
          id: generateId(),
          distance_m: route.distance,
          time_ms: route.time,
          bbox: route.bbox,
          encoded_polyline: route.points,
          ascend_m: route.ascend,
          descend_m: route.descend,
          instructions: route.instructions || [],
          timestamp: new Date()
        };
        dummyRoutes.push(liveRoute);
        return res.json({ success: true, route: liveRoute, all_routes: dummyRoutes });
      }
    }

    return res.json({ success: true, route: dummyRoute, all_routes: dummyRoutes });
  } catch (err) {
    return handleAxiosError(res, err);
  }
});

/** ✅ CREATE (POST) ROUTE */
router.post('/route', (req, res) => {
  const { points, profile } = req.body;
  if (!points || !Array.isArray(points) || points.length < 2) {
    return res.status(400).json({ error: 'Provide at least 2 points as an array' });
  }

  const newRoute = {
    id: generateId(),
    points,
    profile: profile || 'car',
    instructions: [
      { text: 'Start at origin', distance: 0 },
      { text: 'Follow main road', distance: 300 },
      { text: 'Arrive at destination', distance: 500 }
    ],
    distance_m: 800,
    time_ms: 400000,
    encoded_polyline: 'mock_encoded_polyline_456',
    ascend_m: 5,
    descend_m: 4,
    timestamp: new Date()
  };

  dummyRoutes.push(newRoute);
  return res.json({ success: true, message: 'Route created', route: newRoute });
});

/** ✅ UPDATE (PUT) ROUTE */
router.put('/route/:id', (req, res) => {
  const routeIndex = dummyRoutes.findIndex(r => r.id === req.params.id);
  if (routeIndex === -1) return res.status(404).json({ error: 'Route not found' });

  const updatedData = req.body;
  dummyRoutes[routeIndex] = { ...dummyRoutes[routeIndex], ...updatedData, updatedAt: new Date() };
  res.json({ success: true, message: 'Route updated', route: dummyRoutes[routeIndex] });
});

/** ✅ DELETE (DELETE) ROUTE */
router.delete('/route/:id', (req, res) => {
  const routeIndex = dummyRoutes.findIndex(r => r.id === req.params.id);
  if (routeIndex === -1) return res.status(404).json({ error: 'Route not found' });

  const deleted = dummyRoutes.splice(routeIndex, 1);
  res.json({ success: true, message: 'Route deleted', deleted });
});

/** ✅ STATUS CHECK */
router.get('/status', (req, res) => {
  res.json({
    ok: true,
    message: 'GraphHopper proxy running.',
    routes_count: dummyRoutes.length
  });
});

module.exports = router;
