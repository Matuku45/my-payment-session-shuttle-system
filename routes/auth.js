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

 router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username || u.email === username
  );

  if (!user) return res.status(401).json({ success: false, message: "User not found" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ success: false, message: "Invalid password" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "2h" });

  res.json({
    success: true,
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});



router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Missing token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    res.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
});






router.post("/signup", async (req, res) => {
  const { username, email, password, role, name } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  if (users.some((u) => u.username === username || u.email === email)) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: `USR-${Date.now()}`,
    username,
    email,
    passwordHash,
    role,
    name: name || username,
  };

  users.push(newUser);

  res.status(201).json({ success: true, user: { name: newUser.name, email, role } });
});







const JWT_SECRET = "supersecretkey"; // Replace with env var in production


module.exports = router;
