const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: 'test', password: 'test123' },
  { username: 'user2', password: 'password2' }
];


// Validate username
const isValid = (username) => {
  return users.some((user) => user.username === username);
}

// Check if username and password match
const authenticatedUser = (username, password) => {
  const user = users.find((user) => user.username === username && user.password === password);
  return !!user; // Return true if user is found
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Create JWT token
  const token = jwt.sign({ username }, "secretKey", { expiresIn: '1h' });
  
  // Save JWT token in session
  req.session.token = token;
  
  return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  
  // Ensure user is logged in
  const token = req.session.token;
  if (!token) {
    return res.status(401).json({ message: "User is not authenticated" });
  }

  // Verify the token
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token is invalid" });
    }

    const username = decoded.username;

    // Check if the book exists in the database
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has already reviewed the book
    const existingReview = books[isbn].reviews.find((r) => r.username === username);
    
    if (existingReview) {
      // Modify existing review
      existingReview.review = review;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // Add new review
      books[isbn].reviews.push({ username, review });
      return res.status(201).json({ message: "Review added successfully" });
    }
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
