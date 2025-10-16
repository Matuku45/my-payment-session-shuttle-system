const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

// ----------------------
// Import route files
// ----------------------
const carsRouter = require("./routes/cars");
const bookingsRouter = require("./routes/bookings");
const checkoutRouter = require("./routes/checkout");

// ----------------------
// CORS setup
// ----------------------
app.use(
  cors({
    origin: "*", // allow all for testing
  })
);

app.use(express.json());

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
// Root endpoint
// ----------------------
app.get("/", (req, res) => {
  res.json({
    message: "🚐 Shuttle Booking API is running",
    routes: {
      swaggerDocs: "/api-docs",
      cars: "/api/cars",
      bookings: "/api/bookings",
      checkout: "/api/checkout",
    },
  });
});

// ----------------------
// API Routes
// ----------------------
app.use("/api/cars", carsRouter);        // <-- mounted at /api/cars
app.use("/api/bookings", bookingsRouter);
app.use("/api/checkout", checkoutRouter);

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
