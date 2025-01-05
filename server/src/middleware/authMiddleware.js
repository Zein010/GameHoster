
import jwt from "jsonwebtoken";
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer <token>

    if (token == null) return res.sendStatus(401);  // No token present

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);  // Invalid token
        console.log(user);
        req.user = user;
        next();
    });
};
const authMiddleware = { authenticateToken };
export default authMiddleware