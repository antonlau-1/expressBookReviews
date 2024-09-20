const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{ 
  let user = users.find((user) => user.username === username);
  return user !== undefined;
}

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!doesExist(username)) {
      users.push({
        username: username,
        password: password});
      return res.status(200).json({message: "User created successfully"});
    } else {
      return res.status(400).json({message: "User already exists"});
    }
  }
  return res.status(400).json({message: "Unable to register, please check your details."});
});

// Get the book list available in the shop
function getBooks() {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books); // Resolve with the books data
    } else {
      reject(new Error("Books not found")); // Reject if books data is unavailable
    }
  });
}

public_users.get('/', (req, res) => {
  // Use the Promise-based function to fetch books data
  getBooks()
    .then((data) => {
      res.send(JSON.stringify(data, null, 4)); // Send the data as a formatted JSON response
    })
    .catch((error) => {
      console.error("Error fetching books:", error.message);
      res.status(500).json({ message: "Error fetching books" });
    });
});

// Get book details based on ISBN
// Function to get a book by ISBN
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book); // Resolve with the book data
    } else {
      reject(new Error("Book not found")); // Reject if the book is not found
    }
  });
}

// Function to get books by author
function getBooksByAuthor(author) {
  return new Promise((resolve) => {
    const booksArray = Object.values(books);
    const booksByAuthor = booksArray.filter((book) => book.author === author);
    resolve(booksByAuthor); // Resolve with the filtered books
  });
}

// Function to get books by title
function getBooksByTitle(title) {
  return new Promise((resolve) => {
    const booksArray = Object.values(books);
    const filtered = booksArray.filter((book) => book.title === title);
    resolve(filtered); // Resolve with the filtered books
  });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  getBookByISBN(isbn)
    .then((book) => {
      return res.send(JSON.stringify(book, null, 4)); // Send the book data
    })
    .catch((error) => {
      console.error("Error fetching book:", error.message);
      return res.status(404).send('Book not found');
    });
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  getBooksByAuthor(author)
    .then((booksByAuthor) => {
      if (booksByAuthor.length > 0) {
        return res.send(JSON.stringify(booksByAuthor, null, 4)); // Send the filtered books
      } else {
        return res.status(404).send('No books found by this author');
      }
    });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  getBooksByTitle(title)
    .then((filtered) => {
      if (filtered.length > 0) {
        return res.send(JSON.stringify(filtered, null, 4)); // Send the filtered books
      } else {
        return res.status(404).send('No books found with this title');
      }
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;  
  const book = books[isbn];   
  
  if (book) {
    return res.send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).send('Book not found');
  }
});


module.exports.general = public_users;
