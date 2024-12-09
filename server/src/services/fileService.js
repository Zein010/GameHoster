
import { PrismaClient } from "@prisma/client";
import fs, { stat } from "fs";
import pathLib from "path";
import archiver from 'archiver';
import formidable from "formidable";
import { isText } from 'istextorbinary';
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
            modifiedAt: stats.mtime,
            textEditable: stats.isFile() && isText(filePath)
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
    if (fs.existsSync(path + "/" + name))
        return { status: false, msg: "File already exists" }
    try {

        fs.writeFileSync(path + "/" + name, "");

        return { status: true, msg: "File created successfully" }
    } catch (error) {
        console.log({ error })

        return { status: false, msg: "Failed to create file" }
    }
}
const IsTextFile = (filePath) => {

    return isText(filePath)
}
const Zip = async (path, files, subPath) => {
    if (files.length == 0) {
        return { delete: false, fileName: null }
    }
    if (files.length == 1) {
        const filePath = pathLib.join(path, subPath, files[0]);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            return {
                delete: false, fileName: files[0], fileType: pathLib.extname(pathLib.join(path, subPath, files[0]))
            }
        }


    }

    return new Promise((resolve, reject) => {
        const zipFileName = `Download-${Date.now()}-${Math.floor(Math.random() * 1000)}.zip`; // Unique zip filename based on the current timestamp
        const outputPath = pathLib.join(path, subPath, zipFileName); // Path where the zip file will be saved

        // Create a write stream for the output zip file
        const output = fs.createWriteStream(outputPath);

        // Create an archiver instance to zip the files
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        // Pipe the archive output to the write stream (the zip file)
        archive.pipe(output);

        // Append files to the archive
        files.forEach(file => {
            const filePath = pathLib.join(path, subPath, file);
            if (fs.existsSync(filePath)) {
                const fileStat = fs.statSync(filePath);

                if (fileStat.isDirectory()) {
                    // If it's a file, add it to the archive as a file
                    archive.directory(filePath, pathLib.join(subPath, file));
                } else if (fileStat.isFile()) {
                    // If it's a directory, add it to the archive as a directory
                    archive.file(filePath, { name: pathLib.join(subPath, file) });
                }
            } else {
                console.warn(`File ${file} does not exist, skipping.`);
            }
        });

        // Finalize the archive
        archive.finalize();

        // Resolve the promise when the archive is created successfully
        output.on('close', () => {
            resolve({ delete: true, fileName: zipFileName, fileType: "zip" }); // Return the zip file name
        });

        // Reject the promise if an error occurs
        archive.on('error', (err) => {
            reject(err);
        });
    });


}
const GetTextContent = (path) => {

    return fs.readFileSync(path, 'utf8');

}
const Delete = async (path) => {
    fs.rmSync(path, { recursive: true, force: true });
}
const SaveTextContent = (path, content) => {
    fs.writeFileSync(path, content);
}


const FileService = { SaveTextContent, GetTextContent, IsTextFile, Delete, List, NewFolder, NewFile, Zip };
export default FileService