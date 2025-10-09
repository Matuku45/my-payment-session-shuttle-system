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
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: JSON list of all bookings
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
 *           type: string
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               booking: { id: "1", passengerName: "John", route: "A-B", price: 50 }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Booking not found"
 */
router.get("/:id", (req, res) => {
  const booking = bookings.find((b) => b.id === req.params.id);
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
 *               - id
 *               - passengerName
 *               - route
 *               - price
 *             properties:
 *               id:
 *                 type: string
 *               passengerName:
 *                 type: string
 *               route:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               booking: { id: "1", passengerName: "John", route: "A-B", price: 50, createdAt: "2025-10-09T00:00:00Z" }
 */
router.post("/", (req, res) => {
  const { id, passengerName, route, price } = req.body;
  if (!id || !passengerName || !route || !price)
    return res.status(400).json({ success: false, error: "Missing fields" });

  const newBooking = { id, passengerName, route, price, createdAt: new Date() };
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
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passengerName:
 *                 type: string
 *               route:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               booking: { id: "1", passengerName: "John", route: "A-B", price: 60, updatedAt: "2025-10-09T00:00:00Z" }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Booking not found"
 */
router.put("/:id", (req, res) => {
  const bookingIndex = bookings.findIndex((b) => b.id === req.params.id);
  if (bookingIndex === -1)
    return res.status(404).json({ success: false, error: "Booking not found" });

  bookings[bookingIndex] = { ...bookings[bookingIndex], ...req.body, updatedAt: new Date() };
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
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               deletedBooking: { id: "1", passengerName: "John", route: "A-B", price: 50 }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Booking not found"
 */
router.delete("/:id", (req, res) => {
  const bookingIndex = bookings.findIndex((b) => b.id === req.params.id);
  if (bookingIndex === -1)
    return res.status(404).json({ success: false, error: "Booking not found" });

  const deletedBooking = bookings.splice(bookingIndex, 1);
  res.json({ success: true, deletedBooking });
});

module.exports = router;
