// api-security.js

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
// API login HTML form with gradient, animation, and icons
// ----------------------
router.get("/login", (req, res) => {
  res.send(`
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Login</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          /* Body & background */
          body {
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(-45deg, #6a11cb, #2575fc, #ff8c00, #ff0080);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            color: #fff;
          }

          @keyframes gradientBG {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }

          /* Login container */
          .login-container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            width: 350px;
            text-align: center;
            transition: transform 0.3s ease;
          }

          .login-container:hover {
            transform: scale(1.05);
          }

          /* Headings & icons */
          h2 {
            margin-bottom: 25px;
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          h2 i {
            margin-right: 10px;
            color: #ff8c00;
            animation: spin 4s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Inputs */
          input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: none;
            border-radius: 8px;
            font-size: 16px;
          }

          input:focus {
            outline: 2px solid #ff8c00;
          }

          /* Button */
          button {
            width: 100%;
            padding: 12px;
            margin-top: 15px;
            border: none;
            border-radius: 8px;
            background: #ff8c00;
            color: #fff;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s ease;
          }

          button:hover {
            background: #ffa733;
          }

          /* Result output */
          pre {
            background: rgba(0,0,0,0.2);
            padding: 12px;
            border-radius: 8px;
            text-align: left;
            max-height: 220px;
            overflow: auto;
            margin-top: 15px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="login-container">
          <h2><i class="fas fa-key"></i> API Login</h2>
          <form id="loginForm">
            <input type="text" name="username" placeholder="Username" value="API-SPECIALIST" required/>
            <input type="password" name="password" placeholder="Password" value="secure123" required/>
            <button type="submit"><i class="fas fa-sign-in-alt"></i> Login</button>
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
              
              if (json.success) {
                setTimeout(() => {
                  window.location.href = '/api-docs';
                }, 1500);
              }
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
