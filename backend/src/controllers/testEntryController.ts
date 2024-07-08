import { Request, Response } from 'express';
import testEntryService from "../services/testEntryService";

interface RequestBody {
    test_id: string;
    blob_urls: string[];
    status?: string;
}

interface StatusParam {
    status: string;
}

async function createOrUpdate(req: Request<{}, {}, RequestBody>, res: Response): Promise<void> {
    try {
        const { test_id, blob_urls, status } = req.body;
        const updatedEntry = await testEntryService.createOrUpdateTestEntry(test_id, { blob_urls, status });
        res.json(updatedEntry);
    } catch (error:any) {
        res.status(500).json({ message: error.message });
    }
}

async function getByStatus(req: Request<{ status: string }>, res: Response): Promise<void> {
    try {
        const { status } = req.params as StatusParam;
        const entries = await testEntryService.getEntriesByStatus(status);
        res.json(entries);
    } catch (error:any) {
        res.status(500).json({ message: error.message });
    }
}

export default {
    createOrUpdate,
    getByStatus
};
