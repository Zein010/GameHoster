import express from "express";
import UserController from "../controllers/userController.js";
const router = express.Router();

router.post("/Login", UserController.Login);


export default router;
