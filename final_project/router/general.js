const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);
  
  if (userExists) {
      return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  res.status(200).json({ message: "User registered successfully" });
});


public_users.get('/', async function (req, res) {
  try {
      // Simulating async operation
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
      res.status(200).json(books);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books" });
  }
});


  
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) resolve(book);
      else reject("Book not found");
  })
  .then(book => res.status(200).json(book))
  .catch(err => res.status(404).json({ message: err }));
});


public_users.get('/author/:author', async function (req, res) {
  try {
      const author = req.params.author;
      const filteredBooks = Object.values(books).filter(book => book.author === author);
      if (filteredBooks.length > 0) {
          res.status(200).json(filteredBooks);
      } else {
          res.status(404).json({ message: "No books found by this author" });
      }
  } catch (error) {
      res.status(500).json({ message: "Error fetching books" });
  }
});



public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.title === title);
      if (filteredBooks.length > 0) resolve(filteredBooks);
      else reject("No books found with this title");
  })
  .then(filteredBooks => res.status(200).json(filteredBooks))
  .catch(err => res.status(404).json({ message: err }));
});



// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (book && book.reviews) {
      res.status(200).json(book.reviews);
  } else {
      res.status(404).json({ message: "No reviews found for this book" });
  }
});


module.exports.general = public_users;
