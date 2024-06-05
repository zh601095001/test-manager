import {Client} from 'minio';
import config from '../config/default';
import minioClient, {BUCKET_NAME} from "../config/minioConfig";
import {createHash} from 'crypto';
import * as path from 'path';

class FileService {
    private minioClient: Client;

    constructor() {
        this.minioClient = minioClient

        this.ensureBucketExists();
    }

    private async ensureBucketExists() {
        const exists = await this.minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await this.minioClient.makeBucket(BUCKET_NAME, '');
        }
    }

    private async fileExists(bucketName: string, objectName: string): Promise<boolean> {
        try {
            await this.minioClient.statObject(bucketName, objectName);
            return true;
        } catch (error) {
            // @ts-ignore
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    private getFileMd5(buffer: Buffer): string {
        return createHash('md5').update(buffer).digest('hex');
    }

    async uploadFile(file: Express.Multer.File): Promise<{ objectName: string, url: string }> {
        const bucketName = BUCKET_NAME;
        const fileExtension = path.extname(file.originalname);
        const objectName = this.getFileMd5(file.buffer);

        const exists = await this.fileExists(bucketName, objectName);
        if (exists) {
            const url = await this.getFileUrl(objectName);
            return {objectName, url};
        }

        const metaData = {
            'Content-Type': file.mimetype,
            'File-Extension': fileExtension
        };

        // @ts-ignore
        await this.minioClient.putObject(bucketName, objectName, file.buffer, metaData);
        const url = await this.getFileUrl(objectName);
        return {objectName, url};
    }

    private async getFileUrl(objectName: string): Promise<string> {
        return await this.minioClient.presignedGetObject(BUCKET_NAME, objectName, 24 * 60 * 60);
    }

    async downloadFile(objectName: string, res: Express.Response): Promise<void> {

        const stream = await this.minioClient.getObject(BUCKET_NAME, objectName);
        stream.pipe(<NodeJS.WritableStream>res);
    }
}

export const fileService = new FileService();
