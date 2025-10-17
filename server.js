// server.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { router: apiSecurityRouter, authenticate } = require("./api-security");

const app = express();

// ----------------------
// Import route files
// ----------------------
const carsRouter = require("./routes/cars");
const bookingsRouter = require("./routes/bookings");
const checkoutRouter = require("./routes/checkout");
const authRouter = require("./routes/auth"); // optional additional auth

// ----------------------
// Middleware
// ----------------------
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // support HTML forms

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
        "API for booking shuttles, managing cars, bookings, and Stripe checkout sessions.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
      },
    ],
  },
  apis: [path.join(__dirname, "routes/*.js")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ----------------------
// Serve API login page at root
// ----------------------
app.get("/", (req, res) => {
  // Redirect to API login page
  res.redirect("/api-security/login");
});

// ----------------------
// API Routes with authentication
// ----------------------
app.use("/api-security", apiSecurityRouter);

// Protect all API routes with token-based authentication
app.use("/api/cars", authenticate, carsRouter);
app.use("/bookings",  bookingsRouter);
app.use("/api/checkout", authenticate, checkoutRouter);

// Auth routes for user management
app.use("/users", authRouter);

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`🔑 Root login: http://localhost:${PORT}/`);
  console.log(`📄 Swagger docs: http://localhost:${PORT}/api-docs`);
});
