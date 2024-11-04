import express from "express";
import GameController from "../controllers/gameController.js";
const router = express.Router();

router.get("/", GameController.GetAll);
router.get("/StartServer/:id", GameController.StartServer);
router.get("/CheckLogs/:serverId", GameController.DisplayLog);
router.get("/StopServer/:serverId", GameController.StopServer);
router.get("/CheckServer/:serverId", GameController.CheckServerRunning);
router.get("/CreateServer/:versionId", GameController.CreateServer);
router.get("/Version/:id", GameController.GetVersion);
router.get("/Servers/:versionId", GameController.GetServers);
router.post("/Command/:serverId", GameController.OneCommand);
router.get("/Server/:id", GameController.GetServer);
router.get("/:gameId/Versions", GameController.GetVersions);
router.get("/:id", GameController.Get);

export default router;
