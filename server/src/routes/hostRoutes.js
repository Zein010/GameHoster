import express from "express";
import HostController from "../controllers/hostsController.js";
const router = express.Router();

router.get("/", HostController.GetHosts);


export default router;
