
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import pathLib from "path";
import archiver from 'archiver';
const prisma = new PrismaClient();
const List = (path) => {

    const files = fs.readdirSync(path);
    return files.map((file) => {
        const filePath = pathLib.join(path, file);
        const stats = fs.statSync(filePath);

        return {
            name: file,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            extension: stats.isFile() ? pathLib.extname(path + "/" + file) : '',
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
        };
    });
}
const NewFolder = (path, name) => {
    try {

        fs.mkdirSync(path + "/" + name, { recursive: true });
        return true
    } catch (error) {
        console.log({ error })
        return false
    }
}
const NewFile = (path, name) => {
    try {

        fs.writeFileSync(path + "/" + name, "");
        return true
    } catch (error) {
        console.log({ error })
        return false
    }
}
const Zip = async (path, files) => {
    const fileName = `download-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}.zip`
    const zip = fs.createWriteStream(path + "/" + fileName);

    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    archive.pipe(zip);
    files.forEach(file => {
        archive.file(pathLib.join(path, file), { name: file });
    });
    await archive.finalize();
    return fileName

}
const FileService = { List, NewFolder, NewFile, Zip };
export default FileService