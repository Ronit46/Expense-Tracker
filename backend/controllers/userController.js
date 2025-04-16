const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        req.flash('error', 'Please fill all fields');
        return res.redirect('/register');
    }

    if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters');
        return res.redirect('/register');
    }

    try {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();

        // Check if user exists
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
            req.flash('error', 'User already exists');
            return res.redirect('/register');
        }

        // Create user — password will be hashed by schema middleware
        const user = await User.create({ 
            name: trimmedName, 
            email: trimmedEmail, 
            password: password.trim() 
        });

        req.flash('success', 'Registration successful! Please login');
        res.redirect('/login');
    } catch (error) {
        console.error("Register Error:", error);
        req.flash('error', 'Server error');
        res.redirect('/register');
    }
};

const getProfile = async (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'Please login to view profile');
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/login');
        }

        res.render('profile', { 
            user: {
                name: user.name,
                email: user.email,
                memberSince: user.createdAt
            }
        });
    } catch (error) {
        console.error("Profile Error:", error);
        req.flash('error', 'Server error');
        res.redirect('/home');
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.flash('error', 'Please provide email and password');
        return res.redirect('/login');
    }

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        
        if (!user) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password.trim(), user.password);
        
        console.log('Login attempt:', {
            inputPassword: password,
            trimmedPassword: password.trim(),
            storedPassword: user.password,
            isMatch: isMatch
        });

        if (!isMatch) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/login');
        }

        // Set user session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        req.session.save(err => {
            if (err) {
                console.error("Session save error:", err);
                req.flash('error', 'Login failed');
                return res.redirect('/login');
            }
            res.redirect('/home');
        });

    } catch (error) {
        console.error("Login Error:", error);
        req.flash('error', 'Server error');
        res.redirect('/login');
    }
};

module.exports = { registerUser, loginUser, getProfile };
