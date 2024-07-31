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
 *     summary: 更新集成设置
 *     description: 更新并返回集成设置
 *     parameters:
 *       - in: path
 *         name: testid
 *         required: true
 *         schema:
 *           type: string
 *         description: 要更新的测试ID
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
 *                 },
 *                 "integrationResult": [
 *                   {
 *                     "a":"example"
 *                   }
 *                 ]
 *               }
 *     responses:
 *       200:
 *         description: 成功更新
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IntegrationSettings'
 *             examples:
 *               example1:
 *                 value: {
 *                   "settings": {
 *                     "url": "http://www.example.com"
 *                   },
 *                   "integrationResult": [
 *                     {
 *                       "a":"example"
 *                     }
 *                   ]
 *                 }
 *       400:
 *         description: 请求格式无效
 */
router.put('/integration-settings/:testid', IntegrationController.updateIntegrationSettings);


export default router;
