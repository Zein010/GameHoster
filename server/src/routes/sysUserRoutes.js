import express from "express";
import sysUserService from "../controllers/sysUserController.js";
const router = express.Router();

router.get("/", sysUserService.GetAll);

router.get("/Delete/:id", sysUserService.Delete);
router.get("/:id", sysUserService.Get);


export default router;
