const express = require("express");
const router = express.Router();

let cars = [];

/**
 * @swagger
 * tags:
 *   - name: Cars
 *     description: Manage available shuttle cars
 */

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: JSON list of all cars
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 0
 *               cars: []
 */
router.get("/", (req, res) => {
  res.json({ success: true, total: cars.length, cars });
});

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get a car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car found
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               car: { id: "1", name: "Benz", registration: "REG123", numberPlate: "NP123" }
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Car not found"
 */
router.get("/:id", (req, res) => {
  const car = cars.find((c) => c.id === req.params.id);
  if (!car) return res.status(404).json({ success: false, error: "Car not found" });
  res.json({ success: true, car });
});

/**
 * @swagger
 * /cars:
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
 *               name:
 *                 type: string
 *               registration:
 *                 type: string
 *               numberPlate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Car added successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               car: { id: "1", name: "Benz", registration: "REG123", numberPlate: "NP123" }
 */
router.post("/", (req, res) => {
  const { id, name, registration, numberPlate } = req.body;
  if (!id || !name || !registration || !numberPlate)
    return res.status(400).json({ success: false, error: "Missing fields" });

  const newCar = { id, name, registration, numberPlate, createdAt: new Date() };
  cars.push(newCar);
  res.status(201).json({ success: true, car: newCar });
});

/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update car details
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
 *         description: Car updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               car: { id: "1", name: "Benz", registration: "REG123", numberPlate: "NP123", updatedAt: "2025-10-09T00:00:00Z" }
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Car not found"
 */
router.put("/:id", (req, res) => {
  const carIndex = cars.findIndex((c) => c.id === req.params.id);
  if (carIndex === -1)
    return res.status(404).json({ success: false, error: "Car not found" });

  cars[carIndex] = { ...cars[carIndex], ...req.body, updatedAt: new Date() };
  res.json({ success: true, car: cars[carIndex] });
});

/**
 * @swagger
 * /cars/{id}:
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
 *         description: Car deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               deletedCar: { id: "1", name: "Benz", registration: "REG123", numberPlate: "NP123" }
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Car not found"
 */
router.delete("/:id", (req, res) => {
  const carIndex = cars.findIndex((c) => c.id === req.params.id);
  if (carIndex === -1)
    return res.status(404).json({ success: false, error: "Car not found" });

  const deletedCar = cars.splice(carIndex, 1);
  res.json({ success: true, deletedCar });
});

module.exports = router;
