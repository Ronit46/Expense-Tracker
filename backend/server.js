const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const protect = require("./config/authMiddleware");
const { getProfile } = require("./controllers/userController");
// Load environment variables with absolute path
require('dotenv').config({ 
  path: 'C:\\Users\\Mr Ronit\\OneDrive\\Desktop\\Expense-Tracker-main\\backend\\.env' 
});
const cors = require("cors");
const connectDB = require("./config/db");
const session = require("express-session");
const flash = require("express-flash");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./routes/userRoutes");

// Already configured above
console.log('Connecting to MongoDB...');
connectDB().then(() => {
    console.log('MongoDB connection established');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true }));

// Session and Flash Messages
app.use(
    session({
        secret: process.env.SESSION_SECRET || "mysecret",
        resave: true,
        saveUninitialized: true,
        cookie: { 
            secure: false, 
            httpOnly: true, 
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        },
    })
);
app.use(flash());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "frontend/images")));

// Middleware to pass flash messages and user session to views
app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const { loginUser } = require("./controllers/userController");
    loginUser(req, res);
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/home", (req, res) => {
    console.log('Home route session:', req.session);
    if (!req.session.user) {
        console.log('No user session, redirecting to login');
        return res.redirect("/login");
    }
    console.log('Rendering home for user:', req.session.user);
    res.render("home", { user: req.session.user });
});

// Profile Route
app.get("/profile", protect, getProfile);

app.get("/settings", protect, (req, res) => {
    res.render("settings", { user: req.session.user });
});

// API Routes
app.use("/api/users", userRoutes);
const { getStats } = require("./controllers/expenseController");
const expenseRoutes = require("./routes/expenseRoutes");

app.use("/api/expenses", expenseRoutes);
app.get("/stats", protect, getStats);

// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err);
    req.flash("error", "An unexpected error occurred.");
    res.redirect("/");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));