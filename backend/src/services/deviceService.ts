import Device from "../models/deviceModel";
import {getDateInUTC8} from "../utils/utils";
import {IDevice} from "../models/types";

async function setDeviceLocked(device: IDevice) {
    device.locked = true;
    device.lockStartTime = getDateInUTC8();
    await device.save();
}

async function setDeviceUnlocked(device: IDevice) {
    device.locked = false;
    device.lockStartTime = null;
    device.purpose = null;
    await device.save();
}

async function getFreeDevice() {
    const freeDevices = await Device.find({locked: false});
    if (freeDevices.length > 0) {
        const randomDevice = freeDevices[Math.floor(Math.random() * freeDevices.length)];
        await setDeviceLocked(randomDevice)
        return randomDevice;
    }
    return null;
}

async function getFreeDeviceWithName(name: string) {
    const freeDevices = await Device.find({locked: false, name: {$regex: name, $options: 'i'}});
    if (freeDevices.length > 0) {
        const randomDevice = freeDevices[Math.floor(Math.random() * freeDevices.length)];
        await setDeviceLocked(randomDevice)
        return randomDevice;
    }
    return null;
}

async function lockDeviceByIp(ip: string, purpose: string) {
    const device = await Device.findOne({ip});
    if (!device) {
        throw new Error('Device not found');
    }
    if (device.locked) {
        throw new Error('Device already locked');
    }
    device.purpose = purpose
    await setDeviceLocked(device)
    await device.save();
    return device;
}

async function releaseDeviceByIp(ip: string) {
    const device = await Device.findOne({ip});
    if (!device) {
        throw new Error('Device not found');
    }
    if (!device.locked) {
        throw new Error('Device not locked');
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
