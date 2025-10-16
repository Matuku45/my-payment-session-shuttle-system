// routes/checkout.js
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
 *         shuttleId: { type: string }
 *         shuttleRoute: { type: string }
 *         seats: { type: integer }
 *         price: { type: number }
 *         userId: { type: string }
 *         userName: { type: string }
 */

/**
 * @swagger
 * /api/checkout/create:
 *   post:
 *     summary: Create a new Stripe checkout session
 *     tags: [Checkout]
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
      success_url:
        "https://simple-shuttle-booking-system2-bold-shadow-2248.fly.dev/success",
      cancel_url:
        "https://simple-shuttle-booking-system2-bold-shadow-2248.fly.dev/cancel",
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
 *     summary: View all checkout sessions
 *     tags: [Checkout]
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
 */
router.get("/session/:id", (req, res) => {
  const session = sessionsStore.find((s) => s.sessionId === req.params.id);
  if (!session)
    return res.status(404).json({ success: false, error: "Session not found" });
  res.json({ success: true, session });
});

/**
 * @swagger
 * /api/checkout/session/{id}:
 *   put:
 *     summary: Edit a session
 *     tags: [Checkout]
 */
router.put("/session/:id", (req, res) => {
  const index = sessionsStore.findIndex((s) => s.sessionId === req.params.id);
  if (index === -1)
    return res.status(404).json({ success: false, error: "Session not found" });

  sessionsStore[index] = {
    ...sessionsStore[index],
    ...req.body,
    updatedAt: new Date(),
  };

  res.json({ success: true, session: sessionsStore[index] });
});

/**
 * @swagger
 * /api/checkout/session/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Checkout]
 */
router.delete("/session/:id", (req, res) => {
  const index = sessionsStore.findIndex((s) => s.sessionId === req.params.id);
  if (index === -1)
    return res.status(404).json({ success: false, error: "Session not found" });

  const deletedSession = sessionsStore.splice(index, 1);
  res.json({ success: true, deletedSession });
});

module.exports = router;
