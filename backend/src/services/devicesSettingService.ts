// services/devicesSettingService.ts 或一个单独的 init.js/ts 文件中

import DeviceSettings from "../models/DeviceSettings";  // 确保路径正确

const SETTINGS_ID = 'defaultSettings';  // 使用预定义或数据库中已存在的唯一ID

// 初始化设备设置
export const initializeDeviceSettings = async () => {
    try {
        let settings = await DeviceSettings.findById(SETTINGS_ID);
        if (!settings) {
            console.log('Initializing new device settings...');
            settings = new DeviceSettings({
                _id: SETTINGS_ID,
                firmwareList: [],  // 根据需要添加初始值
                switchScript: ''  // 根据需要添加初始值
            });
            await settings.save();
            console.log('Device settings initialized.');
        } else {
            console.log('Device settings already initialized.');
        }
    } catch (error) {
        console.error('Failed to initialize device settings:', error);
    }
};


// 获取设备设置
export const getDeviceSettings = async () => {
    return DeviceSettings.findById(SETTINGS_ID);
};

// 更新设备设置
export const updateDeviceSettings = async (data: any) => {
    return DeviceSettings.findByIdAndUpdate(SETTINGS_ID, data, {new: true, upsert: true});
};

// 添加固件到列表
export const addFirmware = async (firmware: any) => {
    return DeviceSettings.findByIdAndUpdate(SETTINGS_ID, {
        $push: {firmwareList: firmware}
    }, {new: true});
};

// 根据文件名从列表中移除固件
export const removeFirmwareByObjectName = async (objectName: string) => {
    return DeviceSettings.findByIdAndUpdate(SETTINGS_ID, {
        $pull: { firmwareList: { objectName: objectName } }
    }, { new: true });
};