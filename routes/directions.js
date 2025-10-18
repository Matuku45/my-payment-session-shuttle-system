/**
 * @file directions.js
 * @description CRUD API for storing user directions in memory
 */

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid"); // for unique IDs

// In-memory storage
let directionsDB = [];

/**
 * @swagger
 * tags:
 *   - name: Directions
 *     description: CRUD operations for user directions
 */

/**
 * @swagger
 * /api/directions:
 *   get:
 *     summary: Get all directions or filter by email
 *     tags: [Directions]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter directions by user email
 *     responses:
 *       200:
 *         description: List of directions
 */
router.get("/", (req, res) => {
  const { email } = req.query;
  const results = email ? directionsDB.filter((d) => d.email === email) : directionsDB;
  res.json({ success: true, directions: results });
});

/**
 * @swagger
 * /api/directions:
 *   post:
 *     summary: Add a new direction
 *     tags: [Directions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - path
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               path:
 *                 type: string
 *                 example: "Pretoria -> Johannesburg"
 *     responses:
 *       200:
 *         description: Direction added
 */
router.post("/", (req, res) => {
  const { email, path } = req.body;
  if (!email || !path) return res.status(400).json({ success: false, message: "Email and path are required" });

  const newDirection = { id: uuidv4(), email, path };
  directionsDB.push(newDirection);
  res.json({ success: true, direction: newDirection });
});

/**
 * @swagger
 * /api/directions/{id}:
 *   put:
 *     summary: Update a direction by ID
 *     tags: [Directions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Direction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *                 example: "Johannesburg -> Cape Town"
 *     responses:
 *       200:
 *         description: Direction updated
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { path } = req.body;

  const direction = directionsDB.find((d) => d.id === id);
  if (!direction) return res.status(404).json({ success: false, message: "Direction not found" });

  if (path) direction.path = path;
  res.json({ success: true, direction });
});

/**
 * @swagger
 * /api/directions/{id}:
 *   delete:
 *     summary: Delete a direction by ID
 *     tags: [Directions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Direction ID
 *     responses:
 *       200:
 *         description: Direction deleted
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = directionsDB.findIndex((d) => d.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Direction not found" });

  directionsDB.splice(index, 1);
  res.json({ success: true, message: "Direction deleted" });
});

module.exports = router;
