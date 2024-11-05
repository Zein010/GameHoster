
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import pathLib from "path";
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
const FileService = { List };
export default FileService