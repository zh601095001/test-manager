import {Request, Response} from 'express';
import {fileService} from '../services/fileService';

class FileController {
    async uploadFile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).send('No file uploaded.');
                return;
            }

            const {objectName, url} = await fileService.uploadFile(req.file);

            res.status(200).json({message: 'File uploaded successfully', objectName, url});
        } catch (error) {
            // @ts-ignore
            res.status(500).send({message: `Error uploading file: ${error.message}`});
        }
    }

    async downloadFile(req: Request, res: Response): Promise<void> {
        try {
            const objectName = req.params.objectName;

            await fileService.downloadFile(objectName, res);
        } catch (error) {
            // @ts-ignore
            res.status(500).send({message: `Error downloading file: ${error.message}`});
        }
    }
}

export const fileController = new FileController();
