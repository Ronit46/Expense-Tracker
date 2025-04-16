const protect = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not authorized, please login" });
    }
    
    // Attach user to request object
    req.user = req.session.user;
    next();
};

module.exports = protect;
