const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Example validation: check if username is not empty and not already taken
  return username && !users.some(user => user.username === username);
};


const authenticatedUser = (username,password)=>{ //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };

    // Save session and send response
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).json({ message: "Error saving session." });
      }

      console.log("Session saved:", req.session); // Debug log to verify session data
      return res.status(200).send(
        "User successfully logged in. USERTOKEN: " + req.session.authorization.accessToken
      );
    });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password." });
  }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Get the username from the session
  let book = books[isbn]; // Look up the book by ISBN

  if (book) {
    let review = req.body.review; // Get the review from the request body

    // Validate the review input
    if (review && review.trim()) {
      book.reviews[username] = review; // Add or update the review for the user

      // Send a success response with the updated review
      return res.status(200).json({ message: "Review added/updated successfully.", review });
    } else {
      return res.status(400).json({ message: "Invalid review. Please provide a non-empty review." });
    }
  } else {
    return res.status(404).json({ message: "Unable to find book." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Get the username from the session
  let book = books[isbn]; // Look up the book by ISBN

  if (book && book.reviews[username]) {
    delete book.reviews[username]; // Remove the user's review
    return res.status(200).json({ message: `Review for book with ISBN ${isbn} has been deleted.` });
  } else {
    return res.status(404).json({ message: "Unable to find book or review." });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
