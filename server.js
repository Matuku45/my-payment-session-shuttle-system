// server.js
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51RL7bvQjCxIUnFiQOrPE5eY09IT3AnJEgGwfIskXdg8ipkf6SVPyTuCtHawYWfu7jkobdHj8Xkw03xLSVNu2dhxf00ylFOJL4X"
);
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

// ----------------------
// CORS setup
// ----------------------
const allowedOrigins = [
  "*",
  "http://localhost:5173",
  "https://simple-shuttle-booking-system2-bold-shadow-2248.fly.dev",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

// ----------------------
// Environment
// ----------------------
const ENV = process.env.NODE_ENV || "development";

// ----------------------
// Swagger setup
// ----------------------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shuttle Booking API",
      version: "1.0.0",
      description:
        "API for booking shuttles, managing checkout sessions, and integrating with Stripe.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
      },
    ],
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ----------------------
// Root endpoint
// ----------------------
app.get("/", (req, res) => {
  res.json({ message: "Shuttle Booking API is running", environment: ENV });
});

// ----------------------
// In-memory store
// ----------------------
const sessionsStore = [];

// ----------------------
// CRUD + Stripe endpoints
// ----------------------

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
 *         shuttleRoute:
 *           type: string
 *         seats:
 *           type: integer
 *         price:
 *           type: number
 *         userId:
 *           type: string
 *         userName:
 *           type: string
 *       example:
 *         shuttleId: "343"
 *         shuttleRoute: "Cape Town - Stellenbosch"
 *         seats: 2
 *         price: 450
 *         userId: "3333"
 *         userName: "John Doe"
 *     SessionResponse:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *         shuttleId:
 *           type: string
 *         shuttleRoute:
 *           type: string
 *         seats:
 *           type: integer
 *         price:
 *           type: number
 *         userId:
 *           type: string
 *         userName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /create-checkout-session:
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
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessionId:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Stripe checkout session failed
 */
app.post("/create-checkout-session", async (req, res) => {
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
              metadata: { shuttleId, userId, userName },
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
    const message = ENV === "development" ? err.message : "Stripe checkout session failed";
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * @swagger
 * /view-all-sessions:
 *   get:
 *     summary: View all checkout sessions
 *     tags: [Checkout]
 *     responses:
 *       200:
 *         description: Returns all sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SessionResponse'
 */
app.get("/view-all-sessions", (req, res) => {
  res.json({ success: true, total: sessionsStore.length, sessions: sessionsStore });
});

/**
 * @swagger
 * /view-session/{id}:
 *   get:
 *     summary: Get a single session by ID
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session found
 *       404:
 *         description: Session not found
 */
app.get("/view-session/:id", (req, res) => {
  const session = sessionsStore.find((s) => s.sessionId === req.params.id);
  if (!session) return res.status(404).json({ success: false, error: "Session not found" });
  res.json({ success: true, session });
});

/**
 * @swagger
 * /edit-session/{id}:
 *   put:
 *     summary: Edit a session
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shuttleRoute:
 *                 type: string
 *               seats:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       404:
 *         description: Session not found
 */
app.put("/edit-session/:id", (req, res) => {
  const sessionIndex = sessionsStore.findIndex((s) => s.sessionId === req.params.id);
  if (sessionIndex === -1) return res.status(404).json({ success: false, error: "Session not found" });

  sessionsStore[sessionIndex] = {
    ...sessionsStore[sessionIndex],
    ...req.body,
    updatedAt: new Date(),
  };
  res.json({ success: true, session: sessionsStore[sessionIndex] });
});

/**
 * @swagger
 * /delete-session/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       404:
 *         description: Session not found
 */
app.delete("/delete-session/:id", (req, res) => {
  const sessionIndex = sessionsStore.findIndex((s) => s.sessionId === req.params.id);
  if (sessionIndex === -1) return res.status(404).json({ success: false, error: "Session not found" });

  const deletedSession = sessionsStore.splice(sessionIndex, 1);
  res.json({ success: true, deletedSession });
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT} in ${ENV} mode`);
});
