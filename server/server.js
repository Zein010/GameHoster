import express from "express"
import TerminalService from "./src/services/TerminalService.js";
import PrismaService from "./PrismaService.js";
import { Prisma } from "@prisma/client";
import GameRoutes from "./src/routes/gameRoutes.js"
import SysUserRoutes from "./src/routes/sysUserRoutes.js"
const app = express();
app.get("/", (req, res) => {
  console.log("Test")
  res.json({ msg: "Server is running" })
});
app.use("/Game", GameRoutes);
app.use("/SysUser", SysUserRoutes);
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
