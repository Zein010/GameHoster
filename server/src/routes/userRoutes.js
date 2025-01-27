import express from "express";
import UserController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/Login", UserController.Login);
router.get("/profile/2fa/Setup", authMiddleware.authenticateToken, UserController.Generate2FASecret);
router.post("/profile/2fa/Setup", authMiddleware.authenticateToken, UserController.ValidateNew2FA);
router.get("/profile/2fa", authMiddleware.authenticateToken, UserController.GetEnabled2FA);
router.post("/profile/2fa", authMiddleware.authenticateLockedToken, UserController.Authenticate2FAAppCode);
router.get("/profile", authMiddleware.authenticateToken, UserController.Profile);
router.put("/profile", authMiddleware.authenticateToken, UserController.UpdateProfile);


export default router;
