const express = require("express");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51RL7bvQjCxIUnFiQOrPE5eY09IT3AnJEgGwfIskXdg8ipkf6SVPyTuCtHawYWfu7jkobdHj8Xkw03xLSVNu2dhxf00ylFOJL4X"
);

// In-memory session store
let sessionsStore = [];

/**
 * @swagger
 * tags:
 *   - name: Checkout
 *     description: Stripe checkout session operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckoutSessionRequest:
 *       type: object
 *       required:
 *         - shuttleId
 *         - shuttleRoute
 *         - seats
 *         - price
 *         - userId
 *         - userName
 *       properties:
 *         shuttleId:
 *           type: string
 *           example: "SHTL-001"
 *         shuttleRoute:
 *           type: string
 *           example: "Cape Town → Paarl"
 *         seats:
 *           type: integer
 *           example: 2
 *         price:
 *           type: number
 *           example: 120
 *         userId:
 *           type: string
 *           example: "USR-001"
 *         userName:
 *           type: string
 *           example: "Thabiso Mapoulo"
 */

/**
 * @swagger
 * /api/checkout/create:
 *   post:
 *     summary: Create a new Stripe checkout session
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutSessionRequest'
 *     responses:
 *       200:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               sessionId: "cs_test_123456"
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Stripe checkout session failed
 */
router.post("/create", async (req, res) => {
  const { shuttleId, shuttleRoute, seats, price, userId, userName } = req.body;

  if (!shuttleId || !shuttleRoute || !seats || !price || !userId || !userName) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Shuttle Booking: ${shuttleRoute}`,
              description: `Car ID: ${shuttleId}, Seats: ${seats}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: seats,
        },
      ],
      success_url: "https://simple-shuttle-booking-system2-bold-shadow-2248.fly.dev/success",
      cancel_url: "https://simple-shuttle-booking-system2-bold-shadow-2248.fly.dev/cancel",
    });

    const newSession = {
      sessionId: session.id,
      shuttleId,
      shuttleRoute,
      seats,
      price,
      userId,
      userName,
      createdAt: new Date(),
    };

    sessionsStore.push(newSession);
    res.json({ success: true, sessionId: session.id });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ success: false, error: "Stripe checkout session failed" });
  }
});

/**
 * @swagger
 * /api/checkout/sessions:
 *   get:
 *     summary: Get all checkout sessions
 *     tags: [Checkout]
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 1
 *               sessions:
 *                 - sessionId: "cs_test_123"
 *                   shuttleId: "SHTL-001"
 *                   shuttleRoute: "Cape Town → Paarl"
 *                   seats: 2
 *                   price: 120
 *                   userId: "USR-001"
 *                   userName: "Thabiso Mapoulo"
 *                   createdAt: "2025-10-16T20:00:00Z"
 */
router.get("/sessions", (req, res) => {
  res.json({ success: true, total: sessionsStore.length, sessions: sessionsStore });
});

/**
 * @swagger
 * /api/checkout/session/{id}:
 *   get:
 *     summary: Get a single session by ID
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "cs_test_123456"
 *     responses:
 *       200:
 *         description: Session found
 *       404:
 *         description: Session not found
 */
router.get("/session/:id", (req, res) => {
  const session = sessionsStore.find((s) => s.sessionId === req.params.id);
  if (!session) return res.status(404).json({ success: false, error: "Session not found" });
  res.json({ success: true, session });
});

/**
 * @swagger
 * /api/checkout/session/{id}:
 *   put:
 *     summary: Edit a session
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "cs_test_123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seats:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Session updated
 *       404:
 *         description: Session not found
 */
router.put("/session/:id", (req, res) => {
  const index = sessionsStore.findIndex((s) => s.sessionId === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: "Session not found" });

  sessionsStore[index] = { ...sessionsStore[index], ...req.body, updatedAt: new Date() };
  res.json({ success: true, session: sessionsStore[index] });
});

/**
 * @swagger
 * /api/checkout/session/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "cs_test_123456"
 *     responses:
 *       200:
 *         description: Session deleted
 *       404:
 *         description: Session not found
 */
router.delete("/session/:id", (req, res) => {
  const index = sessionsStore.findIndex((s) => s.sessionId === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: "Session not found" });

  const deletedSession = sessionsStore.splice(index, 1);
  res.json({ success: true, deletedSession });
});

module.exports = router;
