// routes/grasshopper-api-route.js
// Express router to interact with GraphHopper APIs (routing, isochrone, optimization, matrix)
// Provides dummy storage for directions for demonstration/testing

const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

// HTTPS agent for keepAlive
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 10 });
const GH_BASE = 'https://graphhopper.com/api/1';

// Dummy in-memory storage for routes
let dummyRoutes = [];

// Utility: get API key
function getApiKey(req) {
  return process.env.GRAPHHOPPER_API_KEY || req.query.key || req.body.key;
}

// Axios error handler
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
 *     description: Routing endpoints using GraphHopper API
 */

/**
 * @swagger
 * /api/graphhopper/route:
 *   get:
 *     summary: Get a route between points (live or dummy)
 *     tags: [GraphHopper]
 *     parameters:
 *       - in: query
 *         name: point
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             example: "52.5160,13.3779"
 *         description: Repeatable lat,lon points
 *       - in: query
 *         name: profile
 *         schema:
 *           type: string
 *           enum: [car, bike, foot]
 *           default: car
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: GraphHopper API key
 *     responses:
 *       200:
 *         description: Route result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 route:
 *                   type: object
 *                   properties:
 *                     distance_m:
 *                       type: number
 *                     time_ms:
 *                       type: number
 *                     bbox:
 *                       type: array
 *                       items:
 *                         type: number
 *                     encoded_polyline:
 *                       type: string
 *                     ascend_m:
 *                       type: number
 *                     descend_m:
 *                       type: number
 *                     instructions:
 *                       type: array
 *                       items:
 *                         type: object
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

    // Save dummy route for testing interface
    const dummyRoute = {
      points,
      profile: req.query.profile || 'car',
      instructions: [
        { text: 'Start at point A', distance: 0 },
        { text: 'Turn right', distance: 200 },
        { text: 'Arrive at point B', distance: 500 }
      ],
      timestamp: new Date()
    };
    dummyRoutes.push(dummyRoute);

    // Call GraphHopper live API
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

    const result = route
      ? {
          distance_m: route.distance,
          time_ms: route.time,
          bbox: route.bbox,
          encoded_polyline: route.points,
          ascend_m: route.ascend,
          descend_m: route.descend,
          instructions: route.instructions || []
        }
      : dummyRoute; // fallback to dummy

    return res.json({ success: true, route: result, dummy_routes: dummyRoutes });
  } catch (err) {
    return handleAxiosError(res, err);
  }
});

/**
 * @swagger
 * /api/graphhopper/route:
 *   post:
 *     summary: Store a route for testing (dummy)
 *     tags: [GraphHopper]
 *     requestBody:
 *       description: Dummy route payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["52.5160,13.3779", "52.5206,13.3862"]
 *               profile:
 *                 type: string
 *                 example: "car"
 *     responses:
 *       200:
 *         description: Route stored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dummy_routes:
 *                   type: array
 */
router.post('/route', (req, res) => {
  const { points, profile } = req.body;
  if (!points || !Array.isArray(points) || points.length < 2) {
    return res.status(400).json({ error: 'Provide at least 2 points as an array' });
  }

  const dummyRoute = {
    points,
    profile: profile || 'car',
    instructions: [
      { text: 'Start at point A', distance: 0 },
      { text: 'Continue straight', distance: 300 },
      { text: 'Arrive at destination', distance: 500 }
    ],
    timestamp: new Date()
  };

  dummyRoutes.push(dummyRoute);

  return res.json({ success: true, dummy_routes: dummyRoutes });
});

/**
 * GET /api/graphhopper/status
 * Simple health check
 */
router.get('/status', (req, res) => {
  res.json({ ok: true, message: 'GraphHopper proxy running fine.' });
});

module.exports = router;
