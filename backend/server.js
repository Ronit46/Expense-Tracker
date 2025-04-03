const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const session = require("express-session");
const flash = require("express-flash");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const User = require("./models/User");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true }));

// Session and Flash Messages
app.use(
    session({
        secret: process.env.SESSION_SECRET || "mysecret",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
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

app.get("/home", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("home");
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "All fields are required.");
        return res.redirect("/login");
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "Invalid credentials.");
            return res.redirect("/login");
        }

        const isMatch = await bcrypt.compare(password.trim(), user.password);
        if (!isMatch) {
            req.flash("error", "Incorrect password. Please try again.");
            return res.redirect("/login");
        }

        req.session.user = { id: user._id, name: user.name, email: user.email };
        console.log("✅ Session Set:", req.session.user);

        req.session.save((err) => {
            if (err) {
                console.log("❌ Session Save Error:", err);
                req.flash("error", "Something went wrong. Try again.");
                return res.redirect("/login");
            }
            console.log("✅ Redirecting to Home");
            return res.redirect("/home");
        });
    } catch (error) {
        console.error("⚠️ Login Error:", error);
        req.flash("error", "An unexpected error occurred.");
        res.redirect("/login");
    }
});

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