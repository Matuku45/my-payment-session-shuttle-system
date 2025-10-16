// booking.js
const express = require("express");
const router = express.Router();

let bookings = [];

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: Manage shuttle bookings
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - id
 *         - shuttle_id
 *         - passengerName
 *         - email
 *         - phone
 *         - route
 *         - date
 *         - time
 *         - seats
 *         - price
 *         - path
 *         - car
 *       properties:
 *         id:
 *           type: integer
 *           example: 745921
 *         shuttle_id:
 *           type: string
 *           example: "SHTL-001"
 *         passengerName:
 *           type: string
 *           example: "Thabiso Mapoulo"
 *         email:
 *           type: string
 *           example: "thabiso@example.com"
 *         phone:
 *           type: string
 *           example: "+27830000000"
 *         route:
 *           type: string
 *           example: "Cape Town → Paarl"
 *         date:
 *           type: string
 *           example: "2025-10-20"
 *         time:
 *           type: string
 *           example: "09:00"
 *         seats:
 *           type: integer
 *           example: 2
 *         price:
 *           type: number
 *           example: 240
 *         path:
 *           type: string
 *           example: "N1 Highway"
 *         car:
 *           type: string
 *           example: "Toyota Quantum"
 *         createdAt:
 *           type: string
 *           example: "2025-10-16T12:00:00Z"
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Returns all bookings
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 1
 *               bookings:
 *                 - id: 745921
 *                   passengerName: "Thabiso Mapoulo"
 *                   route: "Cape Town → Paarl"
 *                   seats: 2
 *                   price: 240
 */
router.get("/", (req, res) => {
  res.json({ success: true, total: bookings.length, bookings });
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
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               booking:
 *                 id: 745921
 *                 passengerName: "Thabiso Mapoulo"
 *                 route: "Cape Town → Paarl"
 *                 price: 240
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
    seats,
    price,
    path,
    car,
  } = req.body;

  // Simple validation
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
    price,
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
  const booking = bookings.find((b) => b.id == req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, error: "Booking not found" });
  }
  res.json({ success: true, booking });
});

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking by ID
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
  const index = bookings.findIndex((b) => b.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Booking not found" });
  }
  const deleted = bookings.splice(index, 1);
  res.json({ success: true, deletedBooking: deleted[0] });
});

module.exports = router;
