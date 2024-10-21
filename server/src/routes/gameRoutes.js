import express from "express";
import GameController from "../controllers/gameController.js";
const router = express.Router();

router.get("/", GameController.GetAll);

router.get("/Version/:id", GameController.GetVersion);
router.get("/Servers/:versionId", GameController.GetServers);
router.get("/Server/:id", GameController.GetServer);
router.get("/:gameId/Versions", GameController.GetVersions);
router.get("/:id", GameController.Get);


export default router;
