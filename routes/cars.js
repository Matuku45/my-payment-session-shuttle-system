const express = require("express");
const router = express.Router();

// In-memory cars storage
let cars = [
  {
    id: "CAR-001",
    name: "Toyota Quantum",
    registration: "2025-QNT-001",
    numberPlate: "CA 123-456",
  },
  {
    id: "CAR-002",
    name: "Ford Transit",
    registration: "2025-FRD-002",
    numberPlate: "CA 789-012",
  },
];

/**
 * @swagger
 * tags:
 *   - name: Cars
 *     description: Manage shuttle cars
 */

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of cars
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 2
 *               cars:
 *                 - id: "CAR-001"
 *                   name: "Toyota Quantum"
 *                   registration: "2025-QNT-001"
 *                   numberPlate: "CA 123-456"
 *                 - id: "CAR-002"
 *                   name: "Ford Transit"
 *                   registration: "2025-FRD-002"
 *                   numberPlate: "CA 789-012"
 */
router.get("/", (req, res) => {
  res.json({ success: true, total: cars.length, cars });
});

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Get a car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "CAR-001"
 *     responses:
 *       200:
 *         description: Car found
 *       404:
 *         description: Car not found
 */
router.get("/:id", (req, res) => {
  const car = cars.find((c) => c.id === req.params.id);
  if (!car) return res.status(404).json({ success: false, error: "Car not found" });
  res.json({ success: true, car });
});

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Add a new car
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - registration
 *               - numberPlate
 *             properties:
 *               id:
 *                 type: string
 *                 example: "CAR-003"
 *               name:
 *                 type: string
 *                 example: "Mercedes Sprinter"
 *               registration:
 *                 type: string
 *                 example: "2025-MRS-003"
 *               numberPlate:
 *                 type: string
 *                 example: "CA 345-678"
 *     responses:
 *       201:
 *         description: Car added
 */
router.post("/", (req, res) => {
  const { id, name, registration, numberPlate } = req.body;
  if (!id || !name || !registration || !numberPlate)
    return res.status(400).json({ success: false, error: "Missing fields" });

  const newCar = { id, name, registration, numberPlate, createdAt: new Date().toISOString() };
  cars.push(newCar);
  res.status(201).json({ success: true, car: newCar });
});

/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Update a car
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               registration:
 *                 type: string
 *               numberPlate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Car updated
 *       404:
 *         description: Car not found
 */
router.put("/:id", (req, res) => {
  const index = cars.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: "Car not found" });

  cars[index] = { ...cars[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, car: cars[index] });
});

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car deleted
 *       404:
 *         description: Car not found
 */
router.delete("/:id", (req, res) => {
  const index = cars.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: "Car not found" });

  const deletedCar = cars.splice(index, 1);
  res.json({ success: true, deletedCar });
});

module.exports = router;
