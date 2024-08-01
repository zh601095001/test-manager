// controllers/emailSettingsController.ts

import {Request, Response} from 'express';
import * as emailSettingsService from '../services/emailSettingsService';

// 创建或更新唯一的邮件服务器设置
export const saveEmailSettings = async (req: Request, res: Response): Promise<any> => {
    const user = req.user as IUser;
    if (!user) return res.status(401).json({message: 'Unauthorized'});
    if (!user.roles.includes("admin")) return res.status(403).json({message: 'Permission denied'});
    try {
        const emailSettings = await emailSettingsService.saveEmailSettings(req.body);
        res.status(200).json({message: 'Email settings saved successfully.', data: emailSettings});
    } catch (error) {
        res.status(500).json({message: 'Error saving email settings.', error});
    }
};

// 获取邮件服务器设置
export const getEmailSettings = async (req: Request, res: Response): Promise<any> => {
    const user = req.user as IUser;
    if (!user) return res.status(401).json({message: 'Unauthorized'});
    if (!user.roles.includes("admin")) return res.status(403).json({message: 'Permission denied'});
    try {
        const emailSettings = await emailSettingsService.getEmailSettings();
        res.status(200).json(emailSettings);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving email settings.', error});
    }
};
