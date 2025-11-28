
import jwt from "jsonwebtoken";
import UserService from "../services/userService.js";
import HostService from "../services/hostService.js";
import { Role } from "@prisma/client";
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer <token>

    if(token!=null)
        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) return res.sendStatus(403);  // Invalid token
            req.user = await UserService.GetUserByID(user.id)
            next();
        });
    else{
        const apiKey = req.header("API-Key");
        if (!apiKey) {
            return res.status(401).json({ error: "Token or API key missing" });
        }
        const server=await HostService.GetHost(process.env.SERVER_ID);
        const userId = req.header("UserID") 

        if (apiKey!==server.apiKey) 
            return res.status(403).json({ error: "Invalid API key" });
        req.user=await UserService.GetUser(parseInt(userId));
        next();
    }

};
const authenticateAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer <token>

    if(token!=null)
        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) return res.sendStatus(403);  // Invalid token
            req.user = await UserService.GetUserByID(user.id)
            if(req.user.role!=Role.ADMIN)
                return res.status(403).json({ error: "Admin only endpoint" });
            next();
        });
    else{
        const apiKey = req.header("API-Key");
        if (!apiKey) {
            return res.status(401).json({ error: "Token or API key missing" });
        }
        const server=await HostService.GetHost(process.env.SERVER_ID);
        const userId = req.header("UserID") 
        if(userId!=null&&userId!=""){
            req.user=await UserService.GetUser(parseInt(userId));
            if(req.user.role!=Role.ADMIN)
                return res.status(403).json({ error: "Admin only endpoint" });

        }
        if (apiKey!==server.apiKey) 
            return res.status(403).json({ error: "Invalid API key" });
        next();
    }

};
const authMiddleware = { authenticateToken,authenticateAdmin };
export default authMiddleware