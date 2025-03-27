const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt"); // ✅ Fix: bcryptjs → bcrypt
const User = require("./models/User");

dotenv.config();

// Debugging Logs
console.log(`MONGO_URI: ${process.env.MONGO_URI || 'not set'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET || 'not set'}`);

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("❌ Environment variables are not set correctly.");
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
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(flash());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to pass flash messages and user session to views
app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.user = req.session.user || null;
    next();
});

// Home Route
app.get("/", (req, res) => {
    res.render("index", { user: req.session.user });
});

// Login Routes
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    console.log("🔹 Login Request Body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        console.log("⚠️ Missing Fields");
        req.flash("error", "All fields are required.");
        return res.redirect("/login");
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User Not Found");
            req.flash("error", "Invalid credentials.");
            return res.redirect("/login");
        }

        console.log("🔹 User Found: Yes");
        console.log("🔹 Entered Password:", password);
        console.log("🔹 Stored Hashed Password:", user.password);

        // 🛠 **Fix: Password Compare Debugging**
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔹 Password Match:", isMatch);

        if (!isMatch) {
            console.log("❌ Password Did Not Match");
            req.flash("error", "Invalid credentials.");
            return res.redirect("/login");
        }

        // ✅ Session store karna
        req.session.user = { id: user._id, name: user.name, email: user.email };
        req.session.save(err => {
            if (err) {
                console.error("❌ Session Save Error:", err);
                req.flash("error", "Something went wrong. Try again.");
                return res.redirect("/login");
            }
            console.log("✅ Login successful!", req.session.user);
            req.flash("success", "Login successful!");
            return res.redirect("/");
        });

    } catch (error) {
        console.error("⚠️ Login Error:", error);
        req.flash("error", "Something went wrong. Try again.");
        return res.redirect("/login");
    }
});

// Register Routes
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    console.log("🔹 Register Request Body:", req.body);

    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        req.flash("error", "All fields are required.");
        return res.redirect("/register");
    }

    if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match.");
        return res.redirect("/register");
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            req.flash("error", "Email already exists.");
            return res.redirect("/register");
        }

        // ✅ Fix: Use bcrypt for hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        console.log("✅ User Registered:", user);

        req.flash("success", "Registration successful! You can now log in.");
        return res.redirect("/login");
    } catch (error) {
        console.error("⚠️ Register Error:", error);
        req.flash("error", "Something went wrong. Try again.");
        return res.redirect("/register");
    }
});

// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
