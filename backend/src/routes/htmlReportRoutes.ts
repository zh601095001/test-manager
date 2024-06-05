import express from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/htmlReportControllers';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * /report-html:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Error uploading file
 */
router.post('/report-html', upload.single('file'), uploadFile);

export default router;
