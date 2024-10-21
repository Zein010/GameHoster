import express from "express"
import TerminalService from "./TerminalService.js";
import PrismaService from "./PrismaService.js";
import { config } from "dotenv";
const app = express();
config();
app.get("/", (req, res) => {
  console.log("Test")
  res.json({ msg: "Server is running" })
});


app.get("/CreateServer", async (req, res) => {
  const gameVersion = await PrismaService.GetGameVersion(1)
  const rand = parseInt((Math.random() * 100) % 100);
  const dirName = `GameServer/${gameVersion.game.dirName}-${rand}`;
  const username = `${gameVersion.game.dirName}-${rand}`;
  await TerminalService.CreateNewDirectory({ name: dirName })
  await TerminalService.CreateUser(username);
  const scriptFile = await TerminalService.DownloadServerData(gameVersion.downloadLink, dirName);
  console.log(gameVersion);
  await TerminalService.SetupRequiredFiles(dirName, gameVersion.getFilesSetup)
  await TerminalService.OwnFile(dirName, username)
  await TerminalService.RunGameServer(dirName, scriptFile, username, gameVersion, true)
  await TerminalService.SetupServerAfterStart(dirName, gameVersion.changeFileAfterSetup);
  await TerminalService.RunGameServerAsync(dirName, scriptFile, username, gameVersion)
  res.json({ msg: "Game server created successfully" });
})
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
