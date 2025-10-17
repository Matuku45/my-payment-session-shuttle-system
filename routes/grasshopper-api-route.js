/**
 * Express router for GraphHopper route handling
 * Features:
 *  - Extract coordinates from GraphHopper Maps URL
 *  - Full CRUD support (Create, Read, Update, Delete)
 *  - Swagger documentation included
 */

const express = require("express");
const axios = require("axios");
const https = require("https");
const router = express.Router();

const GH_BASE = "https://graphhopper.com/api/1";
const httpsAgent = new https.Agent({ keepAlive: true });
let savedRoutes = [];

/**
 * Utility: Extract coordinates from GraphHopper Maps URL
 */
function extractCoordinatesFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const points = urlObj.searchParams.getAll("point");
    return points.map((p) => {
      const coords = p.split("_")[0]; // remove labels
      return coords.replace("%2C", ",").trim();
    });
  } catch {
    return [];
  }
}

/**
 * Utility: Generate unique route ID
 */
function generateRouteId() {
  return "R-" + Math.random().toString(36).substring(2, 9).toUpperCase();
}

/**
 * @swagger
 * tags:
 *   - name: GraphHopper
 *     description: GraphHopper route and coordinate management API
 */

/**
 * @swagger
 * /api/graphhopper/extract:
 *   post:
 *     summary: Extracts coordinates from a GraphHopper Maps URL and saves as a new route
 *     tags: [GraphHopper]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://graphhopper.com/maps/?point=-23.89,29.45_Current+Location&point=-29.86,31.00_Durban&profile=car"
 *     responses:
 *       200:
 *         description: Coordinates extracted and route saved
 */
router.post("/extract", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Please provide a GraphHopper Maps URL" });

  const points = extractCoordinatesFromUrl(url);
  if (points.length < 2)
    return res.status(400).json({ error: "Invalid URL. Must contain at least 2 points" });

  const routeData = {
    id: generateRouteId(),
    points,
    profile: "car",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  savedRoutes.push(routeData);
  return res.status(201).json({
    success: true,
    message: "Route extracted and saved successfully",
    route: routeData,
  });
});

/**
 * @swagger
 * /api/graphhopper/routes:
 *   get:
 *     summary: Retrieve all saved routes
 *     tags: [GraphHopper]
 *     responses:
 *       200:
 *         description: List of saved routes
 */
router.get("/routes", (req, res) => {
  res.json({ count: savedRoutes.length, routes: savedRoutes });
});

/**
 * @swagger
 * /api/graphhopper/routes/{id}:
 *   get:
 *     summary: Retrieve a route by ID
 *     tags: [GraphHopper]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route found
 *       404:
 *         description: Route not found
 */
router.get("/routes/:id", (req, res) => {
  const route = savedRoutes.find((r) => r.id === req.params.id);
  if (!route) return res.status(404).json({ error: "Route not found" });
  res.json(route);
});

/**
 * @swagger
 * /api/graphhopper/routes/{id}:
 *   put:
 *     summary: Update a saved route (points or profile)
 *     tags: [GraphHopper]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Route ID
 *     requestBody:
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
 *                 example: ["-26.2041,28.0473","-26.2151,28.0567"]
 *               profile:
 *                 type: string
 *                 example: "bike"
 *     responses:
 *       200:
 *         description: Route updated
 *       404:
 *         description: Route not found
 */
router.put("/routes/:id", (req, res) => {
  const route = savedRoutes.find((r) => r.id === req.params.id);
  if (!route) return res.status(404).json({ error: "Route not found" });

  const { points, profile } = req.body;
  if (points && Array.isArray(points) && points.length >= 2) route.points = points;
  if (profile) route.profile = profile;

  route.updatedAt = new Date();
  res.json({ success: true, message: "Route updated", route });
});

/**
 * @swagger
 * /api/graphhopper/routes/{id}:
 *   delete:
 *     summary: Delete a saved route by ID
 *     tags: [GraphHopper]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route deleted
 *       404:
 *         description: Route not found
 */
router.delete("/routes/:id", (req, res) => {
  const index = savedRoutes.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Route not found" });

  const deleted = savedRoutes.splice(index, 1);
  res.json({ success: true, message: "Route deleted", deletedRoute: deleted[0] });
});

/**
 * @swagger
 * /api/graphhopper/status:
 *   get:
 *     summary: API health check
 *     tags: [GraphHopper]
 *     responses:
 *       200:
 *         description: Proxy running
 */
router.get("/status", (req, res) => {
  res.json({
    ok: true,
    message: "GraphHopper API proxy running successfully",
    saved_routes_count: savedRoutes.length,
  });
});

module.exports = router;
