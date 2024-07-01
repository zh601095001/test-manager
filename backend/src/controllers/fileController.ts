import {Request, Response} from 'express';
import {fileService} from '../services/fileService';
import {BUCKET_NAME} from "../config/minioConfig";

class FileController {
    async uploadFile(req: Request, res: Response): Promise<void> {
        let {bucketName} = req.params
        bucketName = bucketName || BUCKET_NAME
        try {
            if (!req.file) {
                res.status(400).send('No file uploaded.');
                return;
            }

            const {objectName, url} = await fileService.uploadFile(req.file, bucketName);

            res.status(200).json({message: 'File uploaded successfully', objectName, url});
        } catch (error) {
            // @ts-ignore
            res.status(500).send({message: `Error uploading file: ${error.message}`});
        }
    }

    async downloadFile(req: Request, res: Response): Promise<void> {
        let {bucketName} = req.params
        bucketName = bucketName || BUCKET_NAME
        try {
            const objectName = req.params.objectName;

            await fileService.downloadFile(objectName, res, bucketName);
        } catch (error) {
            // @ts-ignore
            res.status(500).send({message: `Error downloading file: ${error.message}`});
        }
    }

    async getFileUrl(req: Request, res: Response){
        let {bucketName, objectName} = req.params
        try{
            const url = await fileService.getFileUrl(objectName, bucketName)
            res.status(200).json({url})
        }catch (error) {
            // @ts-ignore
            res.status(500).send({message: `获取url失败: ${error.message}`});
        }
    }
}

export const fileController = new FileController();
