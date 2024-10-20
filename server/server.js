import express from "express"
import TerminalService from "./TerminalService.js";
import PrismaService from "./PrismaService.js";
const app = express();
app.get("/", (req, res) => {
  console.log("Test")
  res.json({ mes: "Server is running" })
});
app.get("/CreateServer", async (req, res) => {
  const gameVersion = await PrismaService.GetGameVersion(1)
  const rand = parseInt((Math.random() * 100) % 100);
  const dirName = `GameServer/${gameVersion.game.dirName}-${rand}`;
  const username = `${gameVersion.game.dirName}-${rand}`;
  await TerminalService.CreateNewDirectory({ name: dirName })
  await TerminalService.CreateUser(username);
  await TerminalService.OwnFile(dirName, username)
})
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
