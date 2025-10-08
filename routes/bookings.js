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
 *         description: List of all bookings
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
 *         description: Booking ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking found
 *       404:
 *         description: Booking not found
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
 *       description: Booking object to create
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
 *                 description: Unique booking ID
 *               passengerName:
 *                 type: string
 *                 description: Name of the passenger
 *               route:
 *                 type: string
 *                 description: Shuttle route
 *               price:
 *                 type: number
 *                 description: Booking price
 *     responses:
 *       201:
 *         description: Booking created successfully
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
 *         description: Booking ID to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Fields to update
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passengerName:
 *                 type: string
 *                 description: Updated passenger name
 *               route:
 *                 type: string
 *                 description: Updated shuttle route
 *               price:
 *                 type: number
 *                 description: Updated price
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       404:
 *         description: Booking not found
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
 *         description: Booking ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 */
router.delete("/:id", (req, res) => {
  const bookingIndex = bookings.findIndex((b) => b.id === req.params.id);
  if (bookingIndex === -1)
    return res.status(404).json({ success: false, error: "Booking not found" });

  const deletedBooking = bookings.splice(bookingIndex, 1);
  res.json({ success: true, deletedBooking });
});

module.exports = router;
