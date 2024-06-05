import { Request, Response } from 'express';
import fileService from '../services/htmlReportService';

export const uploadFile = async (req: Request, res: Response) => {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const fileUrl = await fileService.handleFileUpload(file);
        res.send({ url: fileUrl });
};
