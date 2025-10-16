// routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// In-memory user store (replace with DB in production)
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

const JWT_SECRET = "supersecretkey"; // Replace with env variable in production

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User authentication and sessions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserLoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: "thabiso"
 *         password:
 *           type: string
 *           example: "123456"
 *     UserLoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               token: "jwt.token.here"
 *               user:
 *                 name: "Thabiso Mapoulo"
 *                 email: "thabiso@example.com"
 *                 role: "passenger"
 *       401:
 *         description: Invalid credentials
 */
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

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "thabiso"
 *               email:
 *                 type: string
 *                 example: "thabiso@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 example: "passenger"
 *     responses:
 *       201:
 *         description: User created successfully
 */
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

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get logged-in user info
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info
 *       401:
 *         description: Unauthorized
 */
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

module.exports = router;
