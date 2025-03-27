const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const session = require("express-session");
const flash = require("connect-flash");

dotenv.config();

// Debugging Logs
console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET}`);

// Ensure environment variables are set
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("Environment variables are not set correctly.");
    process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session and Flash Messages
app.use(session({
    secret: process.env.SESSION_SECRET || "mysecret", 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true in production with HTTPS
}));
app.use(flash());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to pass flash messages to views
app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Home Route
app.get("/", (req, res) => {
    res.render("index");
});

// Login Routes
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        req.flash("error", "All fields are required.");
        return res.redirect("/login");
    }
    
    // Dummy authentication (replace with real authentication logic)
    if (username === "admin" && password === "password123") {
        req.flash("success", "Login successful!");
        return res.redirect("/");
    } else {
        req.flash("error", "Invalid credentials.");
        return res.redirect("/login");
    }
});

// Register Routes
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
        req.flash("error", "All fields are required.");
        return res.redirect("/register");
    }

    if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match.");
        return res.redirect("/register");
    }

    // Save user to database logic here

    req.flash("success", "Registration successful! You can now log in.");
    res.redirect("/login");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
