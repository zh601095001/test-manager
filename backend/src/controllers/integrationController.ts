import {Request, Response} from "express";
import IntegrationService from "../services/integrationService";

// 获取设备设置
const getIntegrationSettings = async (req: Request, res: Response) => {
    const {testid} = req.params
    try {
        const deviceSettings = await IntegrationService.getIntegrationSettings(testid)
        res.json(deviceSettings);
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

// 更新设备设置
const updateIntegrationSettings = async (req: Request, res: Response) => {
    const {testid} = req.params
    try {
        const updatedDeviceSettings = await IntegrationService.updateIntegrationSettings(testid, req.body);
        res.json(updatedDeviceSettings);
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

export default {
    getIntegrationSettings,
    updateIntegrationSettings
}