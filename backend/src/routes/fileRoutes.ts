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
 * /files/{bucketName}:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the bucket where the file will be stored
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
router.post('/:bucketName', upload.single('file'), fileController.uploadFile);

/**
 * @swagger
 * /files/{bucketName}/{objectName}:
 *   get:
 *     summary: Download a file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the bucket where the file is stored
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
router.get('/:bucketName/:objectName', fileController.downloadFile);

/**
 * @swagger
 * /files/url/{bucketName}/{objectName}:
 *   get:
 *     summary: Get a file URL
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the bucket where the file is stored
 *       - in: path
 *         name: objectName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file for which the URL is requested
 *     responses:
 *       200:
 *         description: URL retrieved successfully
 *       500:
 *         description: Error retrieving URL
 */
router.get("/url/:bucketName/:objectName",fileController.getFileUrl)
export default router;
