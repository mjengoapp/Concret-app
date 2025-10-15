// -------------------------------
// Load environment variables
// -------------------------------
require("dotenv").config();

// -------------------------------
// Import dependencies
// -------------------------------
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");

// -------------------------------
// Initialize app
// -------------------------------
const app = express();

// -------------------------------
// Middleware
// -------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(
  session({
    secret: "construction_secret_key", // change for production
    resave: false,
    saveUninitialized: true,
  })
);

// -------------------------------
// MongoDB Connection
// -------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// -------------------------------
// Import Routes
// -------------------------------
const paystackRoute = require("./routes/paystack");
const excavationRoute = require("./excavation");
const wallingRoute = require("./walling");
const concreteRoute = require("./concrete");
const plasterRoute = require("./plaster");

// -------------------------------
// Use Routes
// -------------------------------
app.use("/api/paystack", paystackRoute);
app.use("/walling", wallingRoute);
app.use("/concrete", concreteRoute);
app.use("/plaster", plasterRoute);
app.use("/excavation", excavationRoute);

// -------------------------------
// Usage Tracker
// -------------------------------
const usageTracker = {};
const FREE_LIMIT = 3;

// -------------------------------
// Middleware: Check Limit per User
// -------------------------------
app.use((req, res, next) => {
  const email = req.session.email || "guest";

  if (!usageTracker[email]) usageTracker[email] = 0;

  if (usageTracker[email] >= FREE_LIMIT) {
    return res.status(403).json({
      message: "Free limit reached. Please subscribe to continue.",
      redirectTo: "/subscribe.html?email=" + encodeURIComponent(email),
    });
  }

  usageTracker[email]++;
  next();
});

// -------------------------------
// Login Page (One-time Email Entry)
// -------------------------------
app.get("/login", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login - Construction Calculator</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          form {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
          }
          input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 6px;
          }
          button {
            padding: 10px 15px;
            background: #007BFF;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <form method="POST" action="/login">
          <h2>Enter your email to start</h2>
          <input type="email" name="email" placeholder="you@example.com" required />
          <button type="submit">Continue</button>
        </form>
      </body>
    </html>
  `);
});

// -------------------------------
// Login Handler
// -------------------------------
app.post("/login", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email required");

  req.session.email = email;
  if (!usageTracker[email]) usageTracker[email] = 0;

  res.redirect("/");
});

// -------------------------------
// Home Page
// -------------------------------
app.get("/", (req, res) => {
  const email = req.session.email;
  if (!email) return res.redirect("/login");

  res.send(`
    <html>
      <head>
        <title>Construction Cost Calculator</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 40px;
            color: #333;
          }
          h1 { color: #007BFF; }
          ul { list-style: none; padding: 0; }
          li { margin: 10px 0; }
          a { text-decoration: none; color: #007BFF; }
          form {
            margin-top: 30px;
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          input {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          button {
            width: 100%;
            padding: 10px;
            background: #007BFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <h1>Welcome, ${email}</h1>
        <h2>Construction Cost Calculator</h2>
        <ul>
          <li><a href="/excavation">⚒️ Excavation</a></li>
          <li><a href="/walling">🏗️ Walling</a></li>
          <li><a href="/concrete">🧱 Concrete Works</a></li>
          <li><a href="/plaster">🪣 Plaster Works</a></li>
        </ul>

        <h2>Buy Tokens (via Paystack)</h2>
        <form id="payForm">
          <input type="number" id="amount" placeholder="Amount (KES)" required>
          <button type="submit">Pay with Paystack</button>
        </form>

        <script>
          document.getElementById('payForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('amount').value;
            const res = await fetch('/api/paystack/initialize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: "${email}", amount })
            });
            const data = await res.json();
            if (data.authorization_url) {
              window.location.href = data.authorization_url;
            } else {
              alert('Payment failed or already at limit.');
            }
          });
        </script>
      </body>
    </html>
  `);
});

// -------------------------------
// Start Server
// -------------------------------
const PORT = process.env.PORT || 5500;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
