
import jwt from "jsonwebtoken";
import UserService from "../services/userService.js";
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer <token>

    if (token == null) return res.sendStatus(401);  // No token present

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403);  // Invalid token
        req.user = await UserService.GetUserByID(user.id)
        next();
    });
};
const authMiddleware = { authenticateToken };
export default authMiddleware