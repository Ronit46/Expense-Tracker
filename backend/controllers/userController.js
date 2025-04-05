const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();

        // Check if user exists and update if it's the test user
        let user = await User.findOne({ email: trimmedEmail });
        if (user) {
            if (trimmedEmail === 'ronit@gmail.com') {
                // Reset password for test user
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash('ronit00', salt);
                await user.save();
                req.flash('success', 'Test user password reset');
                return res.redirect('/login');
            }
            req.flash('error', 'User already exists');
            return res.redirect('/register');
        }

        const salt = await bcrypt.genSalt(10);
        const plainPassword = password.trim();
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        
        console.log('Registering user:', {
            name: trimmedName,
            email: trimmedEmail,
            plainPassword: plainPassword,
            hashedPassword: hashedPassword
        });

        user = await User.create({ 
            name: trimmedName, 
            email: trimmedEmail, 
            password: hashedPassword 
        });

        console.log('User created:', user);

        req.flash('success', 'User registered successfully');
        res.redirect('/login');
    } catch (error) {
        console.error("Register Error:", error);
        req.flash('error', 'Server error');
        res.redirect('/register');
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const trimmedEmail = email.trim().toLowerCase();
        const inputPassword = password.trim();

        // Special handling for test user
        if (trimmedEmail === 'ronit@gmail.com') {
            let user = await User.findOne({ email: trimmedEmail });
            if (!user) {
                // Create test user if doesn't exist
                const salt = await bcrypt.genSalt(10);
                user = await User.create({
                    name: 'Test User',
                    email: trimmedEmail,
                    password: await bcrypt.hash('ronit00', salt)
                });
            }
            // Bypass password check for test user
            req.session.user = {
                id: user._id,
                name: user.name,
                email: user.email
            };
            return res.redirect('/home');
        }

        // Normal login flow for other users
        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(inputPassword, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/login');
        }

        // 3. Create session data
        req.session.regenerate((err) => {
            if (err) {
                console.error("Session regeneration error:", err);
                req.flash('error', 'Login failed');
                return res.redirect('/login');
            }

            req.session.user = {
                id: user._id,
                name: user.name,
                email: user.email
            };

            // 4. Save session before redirect
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    req.flash('error', 'Login failed');
                    return res.redirect('/login');
                }
                res.redirect('/home');
            });
        });

    } catch (error) {
        console.error("Login Error:", error);
        req.flash('error', 'Server error');
        res.redirect('/login');
    }
};

module.exports = { registerUser, loginUser };