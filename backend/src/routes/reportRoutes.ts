import reportController from "../controllers/reportController";

import express from "express";

const router = express.Router();
// Endpoint to merge reports
/**
 * @swagger
 * /report:
 *   post:
 *     summary: Merges test reports based on test_id.
 *     description: Accepts a JSON test report and merges it with existing reports with the same test_id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               test_id:
 *                 type: string
 *                 description: The unique identifier for the test report.
 *               suites:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: A suite of tests.
 *     responses:
 *       200:
 *         description: Successfully merged test report.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestReport'
 *       400:
 *         description: Invalid input, object invalid.
 *     tags:
 *       - Reports
 */
router.post('/report', reportController.mergeReportHandler);
// 获取指定 test_id 的测试报告
/**
 * @swagger
 * /report/{test_id}:
 *   get:
 *     summary: Retrieve a single test report by test_id.
 *     description: Returns a single test report.
 *     parameters:
 *       - in: path
 *         name: test_id
 *         required: true
 *         description: Unique identifier of the test report.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single test report.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestReport'
 *       404:
 *         description: Test report not found.
 *     tags:
 *       - Reports
 */
router.get('/report/:test_id', reportController.getReportHandler);
// 获取所有测试报告
/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Retrieve all test reports.
 *     description: Returns a list of all test reports.
 *     responses:
 *       200:
 *         description: A list of test reports.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TestReport'
 *     tags:
 *       - Reports
 */
router.get('/reports', reportController.getAllReportsHandler);

export default router;
