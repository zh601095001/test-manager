// routes/emailSettingsRoutes.ts

import {Router} from 'express';
import * as emailSettingsController from '../controllers/emailSettingsController';
import passport from "passport";

const router = Router();

/**
 * @swagger
 * /email-settings:
 *   get:
 *     summary: 获取当前的邮件服务器设置
 *     tags: [EmailSettings]
 *     responses:
 *       200:
 *         description: 成功获取邮件服务器设置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emailHost:
 *                   type: string
 *                   example: smtp.example.com
 *                 emailPort:
 *                   type: number
 *                   example: 465
 *                 emailAuthUser:
 *                   type: string
 *                   example: example@example.com
 *                 emailAuthPass:
 *                   type: string
 *                   example: asgiuwbeogbweogweogewog
 *       500:
 *         description: 获取邮件服务器设置时出错
 */
router.get('/email-settings', passport.authenticate('jwt', {session: false}), emailSettingsController.getEmailSettings);

/**
 * @swagger
 * /email-settings:
 *   post:
 *     summary: 创建或更新邮件服务器设置
 *     tags: [EmailSettings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailHost
 *               - emailPort
 *               - emailAuthUser
 *               - emailAuthPass
 *             properties:
 *               emailHost:
 *                 type: string
 *                 example: smtp.example.com
 *               emailPort:
 *                 type: number
 *                 example: 465
 *               emailAuthUser:
 *                 type: string
 *                 example: smtp.example.com
 *               emailAuthPass:
 *                 type: string
 *                 example: asgiuwbeogbweogweogewog
 *     responses:
 *       200:
 *         description: 成功保存邮件服务器设置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email settings saved successfully.
 *                 data:
 *                   $ref: '#/components/schemas/EmailSettings'
 *       500:
 *         description: 保存邮件服务器设置时出错
 */
router.post('/email-settings', passport.authenticate('jwt', {session: false}), emailSettingsController.saveEmailSettings);

export default router;
