import { Router } from 'express';
import multer from 'multer';
import { fileController } from '../controllers/fileController';

const upload = multer();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File management
 */

/**
 * @swagger
 * /files:
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
router.post('/', upload.single('file'), fileController.uploadFile);

/**
 * @swagger
 * /files/{objectName}:
 *   get:
 *     summary: Download a file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: objectName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file to download
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       500:
 *         description: Error downloading file
 */
router.get('/:objectName', fileController.downloadFile);

export default router;
