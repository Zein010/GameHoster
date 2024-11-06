
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
        const zipFileName = `archive-${Date.now()}-${Math.floor(Math.random() * 1000)}.zip`; // Unique zip filename based on the current timestamp
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
                archive.file(filePath, { name: file }); // Add each file to the archive
            } else {
                console.warn(`File ${file} does not exist, skipping.`);
            }
        });

        // Finalize the archive
        archive.finalize();

        // Resolve the promise when the archive is created successfully
        output.on('close', () => {
            console.log(`Zip file created: ${outputPath}`);
            resolve({ delete: true, fileName: zipFileName, fileType: "zip" }); // Return the zip file name
        });

        // Reject the promise if an error occurs
        archive.on('error', (err) => {
            reject(err);
        });
    });


}
const Delete = async (path) => {
    fs.rmSync(path, { recursive: true, force: true });
}
const FileService = { Delete, List, NewFolder, NewFile, Zip };
export default FileService