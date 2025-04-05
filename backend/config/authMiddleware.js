const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        token = token.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = protect;
