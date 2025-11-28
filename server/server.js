import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import GameRoutes from "./src/routes/gameRoutes.js";
import HostRoutes from "./src/routes/hostRoutes.js";
import DiscordRoutes from "./src/routes/discordRoutes.js";
import FileRoutes from "./src/routes/fileRoutes.js";
import SysUserRoutes from "./src/routes/sysUserRoutes.js";
import UserRoutes from "./src/routes/userRoutes.js";
import setupSocketRoutes from "./src/routes/socketRoutes.js";
import fileUpload from "express-fileupload"
import authMiddleware from "./src/middleware/authMiddleware.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(fileUpload({
  createParentPath: true
}))
app.use(cors());
app.use(express.json());

app.use("/Game",authMiddleware.authenticateToken,  GameRoutes);
app.use("/Hosts",authMiddleware.authenticateAdmin,  HostRoutes);
app.use("/Discord", DiscordRoutes);
app.use("/Files", FileRoutes);
app.use("/SysUser", SysUserRoutes);
app.use("/User",UserRoutes);

// Setup socket routes
setupSocketRoutes(io);

server.listen(process.env.SERVER_PORT, () => {
  console.log("Server started on port "+process.env.SERVER_PORT);
});