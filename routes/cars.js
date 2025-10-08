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
 *         description: List of all cars
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
 *         description: The ID of the car to retrieve
 *         schema:
 *           type: string
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
 * /cars:
 *   post:
 *     summary: Add a new car
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       description: Car object to add
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
 *                 description: Unique ID of the car
 *               name:
 *                 type: string
 *                 description: Name of the car
 *               registration:
 *                 type: string
 *                 description: Registration number of the car
 *               numberPlate:
 *                 type: string
 *                 description: License plate of the car
 *     responses:
 *       201:
 *         description: Car added successfully
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
 *         description: ID of the car to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Fields to update for the car
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registration:
 *                 type: string
 *                 description: Updated registration number
 *               numberPlate:
 *                 type: string
 *                 description: Updated license plate
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       404:
 *         description: Car not found
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
 *         description: ID of the car to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car deleted
 *       404:
 *         description: Car not found
 */
router.delete("/:id", (req, res) => {
  const carIndex = cars.findIndex((c) => c.id === req.params.id);
  if (carIndex === -1)
    return res.status(404).json({ success: false, error: "Car not found" });

  const deletedCar = cars.splice(carIndex, 1);
  res.json({ success: true, deletedCar });
});

module.exports = router;
