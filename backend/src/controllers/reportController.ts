import { Request, Response } from 'express';
import reportService from '../services/reportService';

async function mergeReportHandler(req: Request, res: Response): Promise<void> {
    try {
        const mergedReport = await reportService.mergeReports(req.body.test_id, req.body);
        res.json(mergedReport);
    } catch (error) {
        // @ts-ignore
        res.status(500).send({ message: error.message });
    }
}

async function getReportHandler(req: Request, res: Response): Promise<void> {
    try {
        const report = await reportService.getReportByTestId(req.params.test_id);
        if (report) {
            res.json(report);
        } else {
            res.status(404).send('Test report not found.');
        }
    } catch (error) {
        // @ts-ignore
        res.status(500).send({ message: error.message });
    }
}

async function getAllReportsHandler(req: Request, res: Response): Promise<void> {
    try {
        const reports = await reportService.getAllReports();
        res.json(reports);
    } catch (error) {
        // @ts-ignore
        res.status(500).send({ message: error.message });
    }
}

export default {
    mergeReportHandler,
    getReportHandler,
    getAllReportsHandler
};
