import * as DeviceSettingsService from '../services/devicesSettingService';
import express, {Request, Response} from "express";

// 获取设备设置
export const getDeviceSettings = async (req: Request, res: Response) => {
    try {
        const deviceSettings = await DeviceSettingsService.getDeviceSettings();
        res.json(deviceSettings);
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

// 更新设备设置
export const updateDeviceSettings = async (req: Request, res: Response) => {
    try {
        const updatedDeviceSettings = await DeviceSettingsService.updateDeviceSettings(req.body);
        res.json(updatedDeviceSettings);
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};


// 添加固件
export const addFirmware = async (req: Request, res: Response) => {
    try {
        const updatedSettings = await DeviceSettingsService.addFirmware(req.body);
        res.json(updatedSettings);
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

// 移除固件
export const removeFirmwareByObjectName = async (req: Request, res: Response) => {
    try {
        const updatedSettings = await DeviceSettingsService.removeFirmwareByObjectName(req.params.objectName);
        res.json(updatedSettings);
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

