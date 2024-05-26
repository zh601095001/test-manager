import Device from "../models/Device";
import {getDateInUTC8} from "../utils/utils";
import {IDevice} from "../models/types";

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
    device.comment = null;
    await device.save();
}

async function getFreeDevice(status: Status = "locked") {
    const freeDevices = await Device.find({status: "unlocked"});
    if (freeDevices.length > 0) {
        const randomDevice = freeDevices[Math.floor(Math.random() * freeDevices.length)];
        await setDeviceLocked(randomDevice, status)
        return randomDevice;
    }
    return null;
}

async function getFreeDeviceWithName(deviceName: string) {
    const freeDevices = await Device.find({status: "unlocked", deviceName: {$regex: deviceName, $options: 'i'}});
    if (freeDevices.length > 0) {
        const randomDevice = freeDevices[Math.floor(Math.random() * freeDevices.length)];
        await setDeviceLocked(randomDevice)
        return randomDevice;
    }
    return null;
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

async function releaseDeviceByIp(deviceIp: string) {
    const device = await Device.findOne({deviceIp});
    if (!device) {
        throw new Error('未找到设备！');
    }
    if (device.status === "unlocked") {
        throw new Error('设备未被锁定！');
    }
    const oldDevice = device.$clone()
    await setDeviceUnlocked(device)
    return oldDevice;
}


async function getAllDevices() {
    return Device.find();
}

export {
    getFreeDevice,
    lockDeviceByIp,
    releaseDeviceByIp,
    getAllDevices,
    getFreeDeviceWithName
};
