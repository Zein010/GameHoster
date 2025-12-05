import express from "express";
import GameController from "../controllers/gameController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();


router.get("/", GameController.GetAll);
router.get("/StartServer/:id", GameController.StartServer);
router.get("/CheckLogs/:serverId", GameController.DisplayLog);
router.get("/StopServer/:serverId", GameController.StopServer);
router.get("/MoveToHost/:serverId/:hostId", GameController.MoveToHost);
router.post("/ReceiveServer/:serverId/:copyToken", GameController.ReceiveGameServer);
router.get("/CheckServer/:serverId", GameController.CheckServerRunning);
router.get("/CreateServer/:versionId", GameController.CreateServer);
router.get("/Version/:id", GameController.GetVersion);
router.get("/Servers", authMiddleware.authenticateToken, GameController.GetServers);
router.get("/Command/:serverId/GetPlayers", GameController.GetPlayers);
router.get("/Command/:serverId/GetBanned", GameController.GetBannedPlayers);
router.post("/Command/:serverId/Ban", GameController.BanPlayer);
router.post("/Command/:serverId/Unban", GameController.UnBanPlayer);
router.post("/Command/:serverId/Kick", GameController.KickPlayer);
router.post("/Command/:serverId/OP", GameController.OPPlayer);
router.post("/Command/:serverId/DEOP", GameController.DEOPPlayer);
router.get("/GetLog/:serverId", GameController.GetLog);
router.get("/Server/:id", GameController.GetServer);
router.get("/:gameId/Versions", GameController.GetVersions);
router.get("/:id", GameController.Get);

export default router;
