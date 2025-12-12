import express from "express";
import UserController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/Login", UserController.Login);

router.get("/", authMiddleware.authenticateAdmin, UserController.GetUsers);
router.post("/", authMiddleware.authenticateAdmin, UserController.CreateUser);


export default router;
