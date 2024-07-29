import express from 'express';
import IntegrationController from "../controllers/integrationController";

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     IntegrationSettings:
 *       type: object
 *       properties:
 *         settings:
 *           type: object
 *           example: {
 *             "url": "http://www.example.com"
 *           }
 */

/**
 * @swagger
 * /integration-settings/{testid}:
 *   get:
 *     tags: [集成测试]
 *     parameters:
 *       - in: path
 *         name: testid
 *         required: true
 *         schema:
 *           type: string
 *         description: testid
 *     summary: Retrieve the current integration settings
 *     description: Returns the integration settings
 *     responses:
 *       200:
 *         description: A successful response with the current integration settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IntegrationSettings'
 *             examples:
 *               example1:
 *                 value: {
 *                   "settings": {
 *                     "url": "http://www.example.com"
 *                   }
 *                 }
 */
router.get('/integration-settings/:testid', IntegrationController.getIntegrationSettings);
/**
 * @swagger
 * /integration-settings/{testid}:
 *   put:
 *     tags: [集成测试]
 *     parameters:
 *       - in: path
 *         name: testid
 *         required: true
 *         schema:
 *           type: string
 *         description: testid
 *     summary: Update the integration settings
 *     description: Updates and returns the integration settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IntegrationSettings'
 *           examples:
 *             example1:
 *               value: {
 *                 "settings": {
 *                   "url": "http://www.example.com"
 *                 }
 *               }
 *     responses:
 *       200:
 *         description: Successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IntegrationSettings'
 *             examples:
 *               example1:
 *                 value: {
 *                   "settings": {
 *                     "url": "http://www.example.com"
 *                   }
 *                 }
 *       400:
 *         description: Invalid request format
 */
router.put('/integration-settings/:testid', IntegrationController.updateIntegrationSettings);

export default router;
