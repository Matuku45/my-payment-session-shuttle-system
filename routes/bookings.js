const express = require("express");
const router = express.Router();

// In-memory storage for bookings
let bookings = [];

// Default car
const DEFAULT_CAR = { name: "Toyota Quantum" };

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: Manage shuttle bookings
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of all bookings
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 0
 *               bookings: []
 */
router.get("/", (req, res) => {
  res.json({ success: true, total: bookings.length, bookings });
});

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking found
 *       404:
 *         description: Booking not found
 */
router.get("/:id", (req, res) => {
  const booking = bookings.find((b) => b.id === Number(req.params.id));
  if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });
  res.json({ success: true, booking });
});

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shuttle_id
 *               - passengerName
 *               - email
 *               - route
 *               - date
 *               - time
 *             properties:
 *               shuttle_id:
 *                 type: string
 *               passengerName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               route:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               seats:
 *                 type: integer
 *               price:
 *                 type: number
 *               path:
 *                 type: string
 *               car:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post("/", (req, res) => {
  const {
    shuttle_id,
    passengerName,
    email,
    phone,
    route,
    date,
    time,
    seats = 1,
    price = 0,
    path = "",
    car = DEFAULT_CAR.name,
  } = req.body;

  if (!shuttle_id || !passengerName || !email || !route || !date || !time) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const newBooking = {
    id: Math.floor(Math.random() * 1000000),
    shuttle_id,
    passengerName,
    email,
    phone,
    route,
    date,
    time,
    seats,
    price: price * seats,
    path,
    car,
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);
  res.status(201).json({ success: true, booking: newBooking });
});

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passengerName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               route:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               seats:
 *                 type: integer
 *               price:
 *                 type: number
 *               path:
 *                 type: string
 *               car:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       404:
 *         description: Booking not found
 */
router.put("/:id", (req, res) => {
  const bookingIndex = bookings.findIndex((b) => b.id === Number(req.params.id));
  if (bookingIndex === -1)
    return res.status(404).json({ success: false, error: "Booking not found" });

  bookings[bookingIndex] = { ...bookings[bookingIndex], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, booking: bookings[bookingIndex] });
});

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 */
router.delete("/:id", (req, res) => {
  const bookingIndex = bookings.findIndex((b) => b.id === Number(req.params.id));
  if (bookingIndex === -1)
    return res.status(404).json({ success: false, error: "Booking not found" });

  const deletedBooking = bookings.splice(bookingIndex, 1)[0];
  res.json({ success: true, deletedBooking });
});

module.exports = router;
