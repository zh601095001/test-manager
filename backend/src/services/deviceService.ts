import Device from "../models/Device";
import {getDateInUTC8} from "../utils/utils";
import {IDevice, ISSHConfig} from "../models/types";

type Status = "locked" | "unlocked" | "maintained"

async function setDeviceLocked(device: IDevice, status: Status = "locked") {
    device.status = status;
    device.lockTime = getDateInUTC8();
    await device.save();
}

async function setDeviceUnlocked(device: IDevice) {
    device.status = "unlocked";
    device.lockTime = null;
    device.user = null;
    device.comment = "-";
    await device.save();
}

async function lockDeviceByIp(deviceIp: string, user: string) {
    const device = await Device.findOne({deviceIp});
    if (!device) {
        throw new Error('未找到设备！');
    }
    if (device.status === "locked") {
        throw new Error('设备已锁定！');
    }
    device.user = user
    await setDeviceLocked(device)
    await device.save();
    return device;
}

async function releaseDeviceByIp(deviceIp: string, force: boolean) {
    const device = await Device.findOne({deviceIp});
    if (!device) {
        throw new Error('未找到设备！');
    }
    // 不是强制释放，状态不为锁定时，报错
    if (!force && device.status !== "locked") {
        throw new Error('设备未被锁定！');
    }
    const oldDevice = device.$clone()
    await setDeviceUnlocked(device)
    return oldDevice;
}


async function getAllDevices() {
    return Device.find();
}

async function setSshConfig(deviceIp: string, {
    port,
    username,
    password
}: ISSHConfig) {
    const device = await Device.findOne({deviceIp})
    if (!device) {
        throw new Error('未找到设备！');
    }
    device.sshConfig = device.sshConfig || {port: 22, username: "root", password: "root"};
    if (port) {
        device.sshConfig.port = port
    }
    if (username) {
        device.sshConfig.username = username;
    }
    if (password) {
        device.sshConfig.password = password;
    }
    await device.save()
}

interface IRefreshFirmwareConfig {
    flag: boolean;
    refreshScript: string;
}

interface ISwitchFirmwareConfig {
    firmwareList: string[];
    switchScript: string;
    currentFirmware: string;
}

const setRefreshFirmware = async (deviceIp: string, refreshFirmwareConfig: IRefreshFirmwareConfig): Promise<any> => {
    try {
        const device = await Device.findOne({ deviceIp });
        if (!device) {
            throw new Error('Device not found');
        }

        device.refreshFirmware = device.refreshFirmware || {};

        if (refreshFirmwareConfig.flag !== undefined) {
            device.refreshFirmware.flag = refreshFirmwareConfig.flag;
        }
        if (refreshFirmwareConfig.refreshScript !== undefined) {
            device.refreshFirmware.refreshScript = refreshFirmwareConfig.refreshScript;
        }
        await device.save();
    } catch (error) {
        // @ts-ignore
        throw new Error('Error updating refresh firmware settings: ' + error.message);
    }
};


const setSwitchFirmware = async (deviceIp: string, firmwareData: ISwitchFirmwareConfig): Promise<any> => {
    try {
        const device = await Device.findOne({ deviceIp });
        if (!device) {
            throw new Error('Device not found');
        }

        device.switchFirmware = device.switchFirmware || {};

        if (firmwareData.firmwareList !== undefined) {
            device.switchFirmware.firmwareList = firmwareData.firmwareList;
        }
        if (firmwareData.switchScript !== undefined) {
            device.switchFirmware.switchScript = firmwareData.switchScript;
        }
        if (firmwareData.currentFirmware !== undefined) {
            device.switchFirmware.currentFirmware = firmwareData.currentFirmware;
        }
        await device.save();
    } catch (error) {
        // @ts-ignore
        throw new Error('Error updating switch firmware: ' + error.message);
    }
};


export default {
    lockDeviceByIp,
    releaseDeviceByIp,
    getAllDevices,
    setSshConfig,
    setRefreshFirmware,
    setSwitchFirmware
};
