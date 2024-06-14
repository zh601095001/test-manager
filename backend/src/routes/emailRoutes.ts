import emailController from "../controllers/emailController";
import express from "express";

const router = express.Router();

/**
 * @swagger
 * /email:
 *   post:
 *     summary: Send an email
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

export default router;
