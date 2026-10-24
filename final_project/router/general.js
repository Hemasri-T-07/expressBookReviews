const express = require('express');
const axios = require('axios');
const public_users = express.Router();

const books = require('./booksdb.js');
const auth = require('./auth_users.js');

const isValid = auth.isValid;
const users = auth.users;

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: 'Username already exists'
        });
    }

    users.push({ username, password });

    return res.status(200).json({
        message: 'User successfully registered'
    });
});

// Get all books
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            'https://openlibrary.org/search.json?q=the+lord+of+the+rings&limit=1'
        );

        return res.status(200).json(books);
    } catch (error) {
        return res.status(200).json(books);
    }
});

// Get book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const book = books[isbn];

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        await axios.get(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(book.title)}&limit=1`
        );

        return res.status(200).json(book);
    } catch (error) {
        const book = books[req.params.isbn];

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(book);
    }
});

// Get books by author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = decodeURIComponent(req.params.author).toLowerCase();

        const response = await axios.get(
            `https://openlibrary.org/search.json?author=${encodeURIComponent(author)}&limit=1`
        );

        const result = Object.entries(books)
            .filter(([isbn, book]) =>
                book.author &&
                book.author.toLowerCase() === author
            )
            .map(([isbn, book]) => ({ isbn, ...book }));

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books by author'
        });
    }
});

// Get books by title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title).toLowerCase();

        const response = await axios.get(
            `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`
        );

        const result = Object.entries(books)
            .filter(([isbn, book]) =>
                book.title &&
                book.title.toLowerCase() === title
            )
            .map(([isbn, book]) => ({ isbn, ...book }));

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books by title'
        });
    }
});

// Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;

