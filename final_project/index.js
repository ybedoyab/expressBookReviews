const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set up session with a secret for encrypting the session
app.use("/customer", session({ 
  secret: "fingerprint_customer", 
  resave: true, 
  saveUninitialized: true 
}));

// Middleware for authentication for routes starting with /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if session contains a valid token
  if (req.session.token) {
    // Verify the token
    jwt.verify(req.session.token, "fingerprint_customer", (err, user) => {
      if (err) {
        // If token verification fails, return unauthorized
        return res.status(403).json({ message: "Unauthorized" });
      }
      // If verification is successful, attach user data to the request
      req.user = user;
      next(); // Proceed to the next middleware or route handler
    });
  } else {
    // No token found in the session
    return res.status(403).json({ message: "Unauthorized, no token found" });
  }
});

const PORT = 5000;

// Attach customer routes (authentication required)
app.use("/customer", customer_routes);

// Attach general routes (publicly accessible)
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log("Server is running on port", PORT));
