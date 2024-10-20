const express = require("express");
const { default: TerminalService } = require("./TerminalService");

const app = express();
app.get("/", (req, res) => {
});
app.get("/CreateMinecraftServer", (res, res) => {

  TerminalService.CreateNewDirectory({ name: "GameServer/XX/SS" })
  TerminalService.CreateUser("minecraft-wsl");
  TerminalService.OwnFile("GameServer/XX/SS", "minecraft-wsxl")
})
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
