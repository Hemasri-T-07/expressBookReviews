const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const books = require("./router/general");
const customer = require("./router/auth_users");

// Public book routes
app.use("/", books.general);

// Login route and customer routes
app.use("/customer", customer.authenticated);

// Authentication middleware
function isAuthenticatedUser(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Authentication token missing"
        });
    }

    try {
        const decoded = jwt.verify(token, "fingerprint_customer");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// Protected review routes
app.put(
    "/customer/auth/review/:isbn",
    isAuthenticatedUser,
    (req, res, next) => {
        customer.authenticated.handle(req, res, next);
    }
);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

