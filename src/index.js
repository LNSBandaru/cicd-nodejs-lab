const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Sample book data (in-memory for simplicity)
let books = [
  { id: 1, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
  { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen' },
];

let nextBookId = 3;

// --- API Endpoints ---

// GET all books
app.get('/books', (req, res) => {
  res.json(books);
});

// GET a specific book by ID
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find((b) => b.id === id);
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// POST a new book
app.post('/books', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }
  const newBook = { id: nextBookId++, title, author };
  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT (update) an existing book
app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author } = req.body;
  const bookIndex = books.findIndex((b) => b.id === id);
  if (bookIndex !== -1) {
    books[bookIndex] = { ...books[bookIndex], title, author };
    res.json(books[bookIndex]);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// DELETE a book
app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const bookIndex = books.findIndex((b) => b.id === id);
  if (bookIndex !== -1) {
    const deletedBook = books.splice(bookIndex, 1)[0];
    res.json({ message: 'Book deleted', book: deletedBook });
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Book library API listening on port ${port}`);
});
