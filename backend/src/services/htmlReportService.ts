import fs, {createReadStream} from 'fs';
import path from 'path';
import * as tar from 'tar';
import {BUCKET_NAME, ENDPOINT, PORT} from "../config/minioConfig";
import minioClient from '../config/minioConfig';
import mime from 'mime-types';  // 引入 mime-types 库
import {getFileHash} from "../utils/utils";

// Helper function to find 'index.html' recursively
function findFileRecursively(dir: string, filename: string): string | null {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            const result = findFileRecursively(filepath, filename);
            if (result) {
                return result;
            }
        } else if (file === filename) {
            return filepath;
        }
    }
    return null;
}

async function uploadDirectoryToMinio(directoryPath: string, bucketName: string, baseKey: string) {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
        const filepath = path.join(directoryPath, file);
        const fileKey = path.posix.join(baseKey, file);  // 使用 POSIX 风格的路径

        if (fs.statSync(filepath).isDirectory()) {
            await uploadDirectoryToMinio(filepath, bucketName, fileKey);
        } else {
            // 使用 mime-types 库自动确定 Content-Type
            const contentType = mime.lookup(filepath) || 'application/octet-stream';

            await minioClient.fPutObject(bucketName, fileKey, filepath, {"Content-Type": contentType});
        }
    }
}


const handleFileUpload = async (file: Express.Multer.File | string): Promise<string> => {
    const filePath = typeof file === 'string' ? file : file.path;
    const fileHash = await getFileHash(filePath)

    const extractPath = path.join('uploads', fileHash);
    if (!fs.existsSync(extractPath)) {
        fs.mkdirSync(extractPath, {recursive: true});
        await tar.x({
            file: filePath,
            C: extractPath,
        });
    }

    const htmlFilePath = findFileRecursively(extractPath, 'index.html');
    if (!htmlFilePath) {
        throw new Error('No index.html found in the tar file.');
    }

    await uploadDirectoryToMinio(extractPath, BUCKET_NAME, fileHash);

    fs.unlinkSync(filePath);  // Delete the temporary uploaded file
    fs.rmSync(extractPath, {recursive: true, force: true}); // Delete the extracted directory

    const minioUrl = `http://${ENDPOINT}:${PORT}/${BUCKET_NAME}/${fileHash}/index.html`;
    return minioUrl;
};

export default {handleFileUpload};
