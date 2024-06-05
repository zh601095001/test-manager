import {Request, Response} from 'express';
import {downloadAndMergeReports} from '../services/reportSummaryService';

async function handleDownloadMerge(req: Request, res: Response): Promise<void> {
    try {
        const {test_id} = req.params as { test_id: string };
        const result = await downloadAndMergeReports(test_id);
        res.json(result);
    } catch (error) {
        // @ts-ignore
        res.status(500).json({message: error.message});
    }
}

export {handleDownloadMerge};
