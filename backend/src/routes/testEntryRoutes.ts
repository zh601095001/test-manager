import express from "express";
import testEntryController from "../controllers/testEntryController";

const router = express.Router();

/**
 * @swagger
 * /test-entries:
 *   post:
 *     summary: Creates a new test entry or updates an existing one
 *     description: If a test entry with the given test_id exists, updates it; otherwise, creates a new test entry. The status field is optional.
 *     tags:
 *       - Test Entries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - test_id
 *               - blob_urls
 *             properties:
 *               test_id:
 *                 type: string
 *                 description: Unique identifier for the test entry
 *               blob_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of blob URLs associated with the test entry
 *               status:
 *                 type: string
 *                 description: Status of the test entry, either 'unmerged' or 'merged'. This field is optional.
 *     responses:
 *       200:
 *         description: Returns the created or updated test entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestEntry'
 *       500:
 *         description: Internal server error
 */
router.post('/test-entries', testEntryController.createOrUpdate);

/**
 * @swagger
 * /test-entries/{status}:
 *   get:
 *     summary: Retrieves all test entries with the specified status
 *     description: Returns a list of test entries filtered by status.
 *     tags:
 *       - Test Entries
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: The status of the test entries to retrieve
 *     responses:
 *       200:
 *         description: A list of test entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TestEntry'
 *       500:
 *         description: Internal server error
 */
router.get('/test-entries/:status', testEntryController.getByStatus);

export default router;
