const express = require('express');
const public_users = express.Router();

let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

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

    users.push({
        username: username,
        password: password
    });

    return res.status(200).json({
        message: 'User successfully registered'
    });
});

// Get all books
public_users.get('/', async (req, res) => {
    try {
        const result = await Promise.resolve(books);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books'
        });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const book = await Promise.resolve(books[isbn]);

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve book'
        });
    }
});

// Get books based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = decodeURIComponent(req.params.author).toLowerCase();

        const result = await Promise.resolve(
            Object.entries(books)
                .filter(([isbn, book]) =>
                    book.author &&
                    book.author.toLowerCase() === author
                )
                .map(([isbn, book]) => ({ isbn, ...book }))
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books by author'
        });
    }
});

// Get books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title).toLowerCase();

        const result = await Promise.resolve(
            Object.entries(books)
                .filter(([isbn, book]) =>
                    book.title &&
                    book.title.toLowerCase() === title
                )
                .map(([isbn, book]) => ({ isbn, ...book }))
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books by title'
        });
    }
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(books[isbn].reviews || {});
});

module.exports.general = public_users;

