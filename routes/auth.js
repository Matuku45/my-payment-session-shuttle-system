// routes/auth.js
const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// In-memory user store
let users = [
  {
    id: "USR-001",
    username: "thabiso",
    email: "thabiso@example.com",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "passenger",
    name: "Thabiso Mapoulo",
  },
  {
    id: "ADM-001",
    username: "admin",
    email: "admin@example.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    name: "Admin User",
  },
];

const JWT_SECRET = "supersecretkey"; // Replace with env var in production


module.exports = router;
