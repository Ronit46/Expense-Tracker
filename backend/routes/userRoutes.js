const express = require("express");
const protect = require("../config/authMiddleware");
const { registerUser, loginUser, getProfile } = require("../controllers/userController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

module.exports = router;
