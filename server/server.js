import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import GameRoutes from "./src/routes/gameRoutes.js";
import SysUserRoutes from "./src/routes/sysUserRoutes.js";
import setupSocketRoutes from "./src/routes/socketRoutes.js";
import bodyParser from "body-parser";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors()); app.use(bodyParser.urlencoded({
  extended: true
}));

app.use("/Game", GameRoutes);
app.use("/SysUser", SysUserRoutes);

// Setup socket routes
setupSocketRoutes(io);

server.listen(3000, () => {
  console.log("Server started on port 3000");
});