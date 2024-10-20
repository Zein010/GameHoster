import TerminalService from "./TerminalService.js";
// Run a shell command

TerminalService.CreateNewDirectory({ name: "GameServer/XX/SS" })
await TerminalService.CreateUser("minecraft-wsl");
await TerminalService.OwnFile("GameServer/XX/SS", "minecraft-wsl")