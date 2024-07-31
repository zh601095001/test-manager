import emailController from "../controllers/emailController";
import express from "express";

const router = express.Router();

/**
 * @swagger
 * /email:
 *   post:
 *     summary: 发送UI自动化测试报告邮件
 *     description: Sends an email based on the test ID provided.
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - test_id
 *             properties:
 *               test_id:
 *                 type: string
 *                 description: The test ID to include in the email.
 *                 example: '12345'
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Email sent successfully'
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/email', emailController.sendEmail);


/**
 * @swagger
 * /email/integration:
 *   post:
 *     summary: Send an integration email report
 *     description: Sends an automated test report email based on the provided test ID.
 *     tags:
 *       - Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               test_id:
 *                 type: string
 *                 description: The ID of the test to get the report for.
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Email sent to example@example.com"
 *       500:
 *         description: Failed to send email
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to send email."
 */
router.post('/email/integration', emailController.sendIntegrationEmail);
export default router;
