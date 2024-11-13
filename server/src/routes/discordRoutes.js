import express from "express";
import DiscordController from "../controllers/discordController.js";
const router = express.Router();


router.get("/", DiscordController.SendMessage);

export default router;
