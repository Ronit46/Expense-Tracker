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

        res.redirect('/home');

    } catch (error) {
        console.error("Login Error:", error);
        req.flash('error', 'Server error');
        res.redirect('/login');
    }
};

module.exports = { registerUser, loginUser };
