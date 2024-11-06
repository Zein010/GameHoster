import GameService from "../services/gameService.js";
import FileService from "../services/fileService.js";
import pathLib from "path";

const List = async (req, res) => {
    const { serverId } = req.params
    const { path } = req.body
    const server = await GameService.GetServer(Number(serverId))
    const files = FileService.List(pathLib.join(server.path, path));
    res.json({ files })
}

const NewFolder = async (req, res) => {
    const { serverId } = req.params
    const { name, path } = req.body
    const server = await GameService.GetServer(Number(serverId))
    const created = FileService.NewFolder(pathLib.join(server.path, path), name);
    res.json({ created })
}
const NewFile = async (req, res) => {
    const { serverId } = req.params
    const { name, path } = req.body
    const server = await GameService.GetServer(Number(serverId))
    const created = FileService.NewFile(pathLib.join(server.path, path), name);
    res.json({ created })
}
const Download = async (req, res) => {

    const { serverId } = req.params
    const { files } = req.body
    const server = await GameService.GetServer(Number(serverId))
    const zippedFile = await FileService.Zip(server.path, files);
    const file = pathLib.join(server.path, zippedFile);
    res.download(file, 'download.zip', (err) => {
        if (err) {
            console.error("Download error:", err);
            res.status(500).send("Error downloading file");
        }
    });
}
const FileController = { Download, List, NewFile, NewFolder };
export default FileController