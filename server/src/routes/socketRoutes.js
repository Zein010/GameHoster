import GameService from "../services/gameService.js";
import TerminalService from "../services/TerminalService.js";

export default async function setupSocketRoutes(io) {
    io.on("connection", async (socket) => {
        const purpose = socket.handshake.query.purpose;
        const serverId = socket.handshake.query.serverId;

        if (purpose === "terminal") {
            TerminalService.TerminalToSocket(serverId, socket)
        }
    });
}