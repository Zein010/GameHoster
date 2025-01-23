import express from "express";
import UserController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/Login", UserController.Login);
router.get("/profile", authMiddleware.authenticateToken, UserController.Profile);


export default router;
