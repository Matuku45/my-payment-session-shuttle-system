// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Import API security (if file missing, temporarily disable)
let apiSecurityRouter, authenticate;
try {
  const securityModule = require("./api-security");
  apiSecurityRouter = securityModule.router;
  authenticate = securityModule.authenticate;
} catch (err) {
  console.warn("⚠️ api-security.js not found or invalid. Skipping auth for now.");
  apiSecurityRouter = express.Router();
  authenticate = (req, res, next) => next();
}

const app = express();

// ----------------------
// Middleware
// ----------------------
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------
// Import route files
// ----------------------
const carsRouter = require("./routes/cars");
const bookingsRouter = require("./routes/bookings");
const checkoutRouter = require("./routes/checkout");
const authRouter = require("./routes/auth");

// ✅ Make sure this file exists at:
//    C:\Users\Thabiso\my-payment-session-shuttle-system\routes\grasshopper-api-route.js
const graphhopperRouter = require("./routes/grasshopper-api-route");

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
        "API for booking shuttles, managing cars, bookings, checkout, and GraphHopper routing.",
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
  res.redirect("/api-security/login");
});

// ----------------------
// API Routes with authentication
// ----------------------
app.use("/api-security", apiSecurityRouter);
app.use("/api/cars", authenticate, carsRouter);
app.use("/bookings", bookingsRouter);
app.use("/api/checkout", authenticate, checkoutRouter);
app.use("/users", authRouter);

// ----------------------
// ✅ GraphHopper API Routes
// ----------------------
app.use("/api/graphhopper", graphhopperRouter);

// ----------------------
// 404 & Error Handling
// ----------------------
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`🔑 Root login: http://localhost:${PORT}/`);
  console.log(`📄 Swagger docs: http://localhost:${PORT}/api-docs`);
  console.log(`🗺️ GraphHopper route: http://localhost:${PORT}/api/graphhopper/route`);
});
