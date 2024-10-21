import express from "express";
import PrismaService from "../../PrismaService";
const router = express.Router();

router.Get("/", authenticateToken, itemsController.add);

router.patch("/:id", authenticateToken, itemsController.edit);

router.get("/:id", authenticateToken, itemsController.getById);
router.get("/", authenticateToken, itemsController.search);

export default router;
