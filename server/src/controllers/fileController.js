import GameService from "../services/gameService.js";
import FileService from "../services/fileService.js";
import pathLib from "path";
import { fstat } from "fs";
import { isArray } from "util";
import TerminalService from "../services/TerminalService.js";

const List = async (req, res) => {
    const { serverId } = req.params
    const { path } = req.body
    const server = await GameService.GetServer(Number(serverId))
    const files = FileService.List(pathLib.join(server.path, path));
    res.json({ files })
}

const GetTextContent = async (req, res) => {

    const { serverId } = req.params
    const { path } = req.body
    const server = await GameService.GetServer(Number(serverId))
    if (FileService.IsTextFile(pathLib.join(server.path, path))) {
        const content = FileService.GetTextContent(pathLib.join(server.path, path));
        res.json({ content })
    } else {
        res.status(404).json({ "msg": "File not found" })
    }
}
const SaveContent = async (req, res) => {

    const { serverId } = req.params
    const { path, content } = req.body
    const server = await GameService.GetServer(Number(serverId))
    if (FileService.IsTextFile(pathLib.join(server.path, path))) {
        const saved = FileService.SaveTextContent(pathLib.join(server.path, path), content);
        res.json({ saved })
    } else {
        res.status(404).json({ "msg": "File not found" })
    }
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
    const result = FileService.NewFile(pathLib.join(server.path, path), name);
    if (!result.status)
        return res.status(400).json({ "msg": result.msg })
    res.json({ success: result.status, msg: result.msg })
}
const Download = async (req, res) => {

    const { serverId } = req.params
    const { files, path } = req.body
    const server = await GameService.GetServer(Number(serverId))
    const zippedFile = await TerminalService.CreateZip(files, server.path, path);
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

                    // FileService.Delete(pathLib.join(server.path, path, zippedFile.fileName));
                }
        });
    }
    else res.status(404).json({ "msg": "File not found" })

}
const Delete = async (req, res) => {

    const { serverId } = req.params
    const { path, files } = req.body
    const server = await GameService.GetServer(Number(serverId))
    files.forEach(file => {

        FileService.Delete(pathLib.join(server.path, path, file));
    })
    res.json({ success: true, msg: "Files deleted successfully" })
}
const Upload = async (req, res) => {
    try {
        if (!req.files)
            return res.status(400).json({ message: 'No file uploaded' });


        const { serverId } = req.params
        const { path } = req.body
        const server = await GameService.GetServer(Number(serverId))

        Object.values(req.files).forEach(files => {
            if (Array.isArray(files)) {

                files.forEach(file => {
                    if (file.name.includes(server.gameVersion.scriptFile)) return
                    file.mv(pathLib.join(server.path, path, file.name))
                })
            } else {
                files.mv(pathLib.join(server.path, path, files.name))

            }
        })
        res.json({ status: true, msg: "FIle uploaded successfully" })


    } catch (e) {
        console.log({ e })
        res.status(500).send(e)
    }

}
const FileController = { SaveContent, GetTextContent, Upload, Delete, Download, List, NewFile, NewFolder };
export default FileController