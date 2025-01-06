import express from "express";
import FileController from "../controllers/fileController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();


router.post("/:serverId", authMiddleware.authenticateToken, FileController.List);
router.post("/:serverId/File", authMiddleware.authenticateToken, FileController.NewFile);
router.post("/:serverId/Folder", authMiddleware.authenticateToken, FileController.NewFolder);
router.post("/:serverId/Download", authMiddleware.authenticateToken, FileController.Download);
router.post("/:serverId/Delete", authMiddleware.authenticateToken, FileController.Delete);
router.post("/:serverId/Upload", authMiddleware.authenticateToken, FileController.Upload);
router.post("/:serverId/GetContent", authMiddleware.authenticateToken, FileController.GetTextContent);
router.post("/:serverId/SaveContent", authMiddleware.authenticateToken, FileController.SaveContent);

export default router;
