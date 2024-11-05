import express from "express";
import FileController from "../controllers/fileController.js";
const router = express.Router();

router.get("/:serverId", FileController.List);

export default router;
