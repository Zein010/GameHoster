import express from "express"
import TerminalService from "./src/services/TerminalService.js";
import PrismaService from "./PrismaService.js";
import { Prisma } from "@prisma/client";
import GameRoutes from "./src/routes/gameRoutes.js"
const app = express();
app.get("/", (req, res) => {
  console.log("Test")
  res.json({ msg: "Server is running" })
});
app.use("/Game", GameRoutes);
app.get("/RunningServers", async (req, res) => {
  const resx = await PrismaService.GetRunningServers();
  res.json({ resx });
})
app.get("/CreateServer", async (req, res) => {
  const gameVersion = await PrismaService.GetGameVersion(1)
  const rand = parseInt((Math.random() * 100) % 100);
  const dirName = `GameServer/${gameVersion.game.dirName}-${rand}`;
  const username = `${gameVersion.game.dirName}-${rand}`;
  console.log({ username })
  await TerminalService.CreateNewDirectory({ name: dirName })
  await TerminalService.CreateUser(username);

  const scriptFile = await TerminalService.DownloadServerData(gameVersion.downloadLink, dirName);
  await TerminalService.SetupRequiredFiles(dirName, gameVersion.getFilesSetup)
  await TerminalService.RunGameServer(dirName, scriptFile, username, gameVersion)
  await TerminalService.OwnFile(dirName, username)
  const runningServer = await PrismaService.AddRunningServer(dirName, username, gameVersion.id, scriptFile)
  await TerminalService.SetupServerAfterStart(dirName, gameVersion.changeFileAfterSetup);
  const PID = TerminalService.StartCreatedServer(dirName, scriptFile, username, gameVersion, runningServer.id)
  await PrismaService.SetRunningServerPID(runningServer.id, PID)
  res.json({ msg: "Game server created successfully" });
})
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
