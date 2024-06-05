import express from 'express';
import { handleDownloadMerge } from '../controllers/reportSummaryController';

const router = express.Router();

/**
 * @swagger
 * /merge-reports/{test_id}:
 *   get:
 *     summary: Merges and downloads reports based on test ID
 *     description: Fetches blob URLs associated with the given test ID, merges reports, and compresses them into a zip file.
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: path
 *         name: test_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier for the test entries
 *     responses:
 *       200:
 *         description: Successfully merged and processed the reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 directory:
 *                   type: string
 *                   description: The directory where the reports are stored
 *                 zip:
 *                   type: string
 *                   description: Path to the compressed zip file containing the merged reports
 *       500:
 *         description: Error occurred during the operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining what went wrong
 */
router.get('/merge-reports/:test_id', handleDownloadMerge);

export default router;
