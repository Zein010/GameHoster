import express from "express";
import FileController from "../controllers/fileController.js";
const router = express.Router();

router.post("/:serverId", FileController.List);
router.post("/:serverId/File", FileController.NewFile);
router.post("/:serverId/Folder", FileController.NewFolder);
router.post("/:serverId/Download", FileController.Download);

export default router;
