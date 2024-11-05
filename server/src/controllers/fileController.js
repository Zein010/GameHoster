import GameService from "../services/gameService.js";
import FileService from "../services/fileService.js";


const List = async (req, res) => {
    const { serverId } = req.params
    const server = await GameService.GetServer(Number(serverId))
    const files = FileService.List(server.path);
    res.json({ files })
}
const FileController = { List };
export default FileController