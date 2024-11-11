import express from "express";
import FileController from "../controllers/fileController.js";
const router = express.Router();


router.post("/:serverId", FileController.List);
router.post("/:serverId/File", FileController.NewFile);
router.post("/:serverId/Folder", FileController.NewFolder);
router.post("/:serverId/Download", FileController.Download);
router.post("/:serverId/Delete", FileController.Delete);
router.post("/:serverId/Upload", FileController.Upload);
router.post("/:serverId/GetContent", FileController.GetTextContent);
router.post("/:serverId/SaveContent", FileController.SaveContent);

export default router;
