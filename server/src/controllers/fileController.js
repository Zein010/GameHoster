import GameService from "../services/gameService.js";
import FileService from "../services/fileService.js";
import pathLib from "path";
import { fstat } from "fs";

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
    const { files, path } = req.body
    const server = await GameService.GetServer(Number(serverId))
    const zippedFile = await FileService.Zip(pathLib.join(server.path, path), files);
    const file = pathLib.join(server.path, zippedFile);

    res.setHeader('Content-Disposition', `attachment; filename="${zippedFile}"`);
    res.setHeader('Content-Type', 'application/zip');
    res.download(file, (err) => {

        if (err) {
            console.log({ err })
        } else
            FileService.Delete(pathLib.join(server.path, zippedFile));
    });
}
const FileController = { Download, List, NewFile, NewFolder };
export default FileController