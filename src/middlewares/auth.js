const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        
        if (!token) {
            return res.status(401).json({ 
                message: "Authentication required. Please log in.",
                error: "NO_TOKEN"
            });
        }
        
        const decodedMessage = jwt.verify(token, "codecrush@123456789");
        const { _id } = decodedMessage;
        const user = await User.findById(_id);
        
        if (!user) {
            return res.status(401).json({ 
                message: "User not found. Please log in again.",
                error: "USER_NOT_FOUND"
            });
        }
        
        req.user = user;
        next();
    } catch (err) {
        // JWT verification errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: "Invalid authentication token. Please log in again.",
                error: "INVALID_TOKEN"
            });
        }
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Session expired. Please log in again.",
                error: "TOKEN_EXPIRED"
            });
        }
        
        res.status(401).json({ 
            message: "Authentication failed: " + err.message,
            error: "AUTH_ERROR"
        });
    }
};

module.exports = { userAuth };
