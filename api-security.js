const express = require("express");
const crypto = require("crypto");
const router = express.Router();

// ----------------------
// Dummy user
// ----------------------
const dummyUser = {
  id: "USER-001",
  username: "API-SPECIALIST",
  password: "secure123",
  email: "apispecialist@example.com",
  role: "admin",
};

// In-memory token store
let tokenStore = [];

// ----------------------
// Middleware to protect routes
// ----------------------
function authenticate(req, res, next) {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(401).json({ success: false, error: "Unauthorized: Token required" });

  const session = tokenStore.find((t) => t.token === token);
  if (!session)
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid token" });

  req.user = session.userId;
  next();
}

// ----------------------
// API login HTML form with nice styling
// ----------------------
router.get("/login", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>API Login</title>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(to right, #6a11cb, #2575fc);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;
          }
          .login-container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            width: 300px;
            text-align: center;
          }
          h2 {
            margin-bottom: 20px;
          }
          input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: none;
            border-radius: 6px;
          }
          button {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            border: none;
            border-radius: 6px;
            background: #ff8c00;
            color: #fff;
            font-weight: bold;
            cursor: pointer;
          }
          button:hover {
            background: #ffa733;
          }
          pre {
            background: rgba(0,0,0,0.2);
            padding: 10px;
            border-radius: 6px;
            text-align: left;
            max-height: 200px;
            overflow: auto;
          }
        </style>
      </head>
      <body>
        <div class="login-container">
          <h2>API Login</h2>
          <form id="loginForm">
            <input type="text" name="username" placeholder="Username" value="API-SPECIALIST" required/>
            <input type="password" name="password" placeholder="Password" value="secure123" required/>
            <button type="submit">Login</button>
          </form>
          <pre id="result"></pre>
        </div>

        <script>
          const form = document.getElementById('loginForm');
          const result = document.getElementById('result');

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
              username: form.username.value,
              password: form.password.value
            };
            try {
              const res = await fetch('/api-security/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              const json = await res.json();
              result.textContent = JSON.stringify(json, null, 2);
            } catch (err) {
              result.textContent = 'Error: ' + err;
            }
          });
        </script>
      </body>
    </html>
  `);
});

// ----------------------
// Handle login POST (JSON)
// ----------------------
router.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body;

  if (username === dummyUser.username && password === dummyUser.password) {
    const token = crypto.randomBytes(16).toString("hex");
    tokenStore.push({ token, userId: dummyUser.id, createdAt: new Date() });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: dummyUser.id,
        username: dummyUser.username,
        email: dummyUser.email,
        role: dummyUser.role,
      },
    });
  }

  res.status(401).json({ success: false, message: "Invalid credentials" });
});

// ----------------------
// Export
// ----------------------
module.exports = { router, authenticate };
