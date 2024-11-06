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
    const zippedFile = await FileService.Zip(server.path, files, path);
    if (zippedFile.fileName) {
        const file = pathLib.join(server.path, path, zippedFile.fileName);

        const mimeType = zippedFile.fileType
            ? `application/${zippedFile.fileType.replace(".", "")}`
            : 'application/octet-stream';

        res.setHeader('Content-Disposition', `attachment; filename="${zippedFile.fileName}"`);
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Access-Control-Allow-Origin', '*'); // Or specify your origin
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.download(file, (err) => {

            if (err) {
                console.log({ err })
            } else
                if (zippedFile.delete) {

                    FileService.Delete(pathLib.join(server.path, path, zippedFile.fileName));
                }
        });
    }
    else res.status(404).json({ "msg": "File not found" })

}
const FileController = { Download, List, NewFile, NewFolder };
export default FileController