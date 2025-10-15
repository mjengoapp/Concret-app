// Load environment variables
require("dotenv").config();

// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// Import Routes
const paystackRoute = require("./routes/paystack");
const excavationRoute = require("./excavation");
const wallingRoute = require("./walling");
const concreteRoute = require("./concrete");
const plasterRoute = require("./plaster");

// Use Routes
app.use("/api/paystack", paystackRoute);
app.use("/walling", wallingRoute);
app.use("/concrete", concreteRoute);
app.use("/plaster", plasterRoute);
app.use("/excavation", excavationRoute);

// ✅ Usage tracker (in-memory for simplicity)
const usageTracker = {};
const FREE_LIMIT = 3; // e.g. 3 free calculations per email/device

// ✅ Middleware to check limit before processing routes
app.use((req, res, next) => {
  const email = req.query.email || req.body.email || "guest";
  if (!usageTracker[email]) usageTracker[email] = 0;

  if (usageTracker[email] >= FREE_LIMIT) {
    return res.status(403).json({
      message: "Free limit reached. Please subscribe to continue.",
      redirectTo: "/subscribe.html?email=" + encodeURIComponent(email),
    });
  }

  // Increment usage count
  usageTracker[email]++;
  next();
});

// ✅ Home page
app.get("/", (req, res) => {
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

          /* Modal Styles */
          #limitModal {
            display: none;
            position: fixed;
            z-index: 9999;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
          }
          #modalContent {
            background: white;
            padding: 30px;
            margin: 100px auto;
            border-radius: 10px;
            max-width: 400px;
            text-align: center;
          }
          #modalContent button {
            margin-top: 20px;
            background: #28a745;
          }
        </style>
      </head>
      <body>
        <h1>Construction Cost Calculator</h1>
        <ul>
          <li><a href="/excavation">⚒️ Excavation</a></li>
          <li><a href="/walling">🏗️ Walling</a></li>
          <li><a href="/concrete">🧱 Concrete Works</a></li>
          <li><a href="/plaster">🪣 Plaster Works</a></li>
        </ul>

        <h2>Buy Tokens (via Paystack)</h2>
        <form id="payForm">
          <input type="email" id="email" placeholder="Enter your email" required>
          <input type="number" id="amount" placeholder="Amount (KES)" required>
          <button type="submit">Pay with Paystack</button>
        </form>

        <!-- Payment Limit Modal -->
        <div id="limitModal">
          <div id="modalContent">
            <h2>Free Limit Reached</h2>
            <p>You’ve reached your free calculation limit. Please subscribe to continue using this service.</p>
            <button id="goToPayment">Go to Payment Page</button>
          </div>
        </div>

        <script>
          // Payment form handler
          document.getElementById('payForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const amount = document.getElementById('amount').value;

            try {
              const res = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, amount })
              });

              const data = await res.json();

              if (data.authorization_url) {
                window.location.href = data.authorization_url;
              } else if (data.message && data.message.includes('Free limit')) {
                document.getElementById('limitModal').style.display = 'block';
                document.getElementById('goToPayment').onclick = () => {
                  window.location.href = data.redirectTo;
                };
              } else {
                alert('Failed to initialize payment.');
              }
            } catch (err) {
              console.error(err);
              alert('Error connecting to payment gateway.');
            }
          });
        </script>
      </body>
    </html>
  `);
});

// ✅ Start Server
const PORT = process.env.PORT || 5500;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
