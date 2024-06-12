import express, {Request, Response} from "express";
import * as deviceService from "../services/deviceService";
import async from "async";
import Device from "../models/Device";
import {DeviceRequest, LockDeviceRequest, LockFreeDeviceRequest, Task, UpdateDeviceRequest} from "./types";
import {IDevice} from "../models/types";

const waitingQueue: Task[] = [];


const requestQueue = async.queue(async (task: Task, callback: (error?: Error | null, device?: IDevice | null) => void) => {
    try {
        const device: IDevice | null = await deviceService.getFreeDevice(task.status || "locked");
        if (!device) {
            waitingQueue.push(task);
            callback(new Error('无可用设备'), null);
            return;
        }
        device.user = task.user;
        device.comment = task.comment;
        // @ts-ignore
        device.status = task.status;
        await device.save();
        callback(null, device);
    } catch (error) {
        // @ts-ignore
        callback(error);
    }
}, 1);


async function resolveWaitingRequests(): Promise<void> {
    while (waitingQueue.length > 0) {
        const task = waitingQueue.shift();
        if (!task) continue;

        try {
            const device: IDevice | null = await deviceService.getFreeDevice();
            if (!device) {
                waitingQueue.unshift(task);  // Put the task back at the beginning of the queue if no device is available
                break;  // Exit the loop if no devices are available
            }
            device.user = task.user || "";
            device.comment = task.comment || "";
            device.status = task.status || "locked";
            await device.save();
            task.res.json({
                message: `设备 ${device.deviceIp} 由 ${device.user} 锁定.`,
                device,
            });
        } catch (error) {
            if (task.res.headersSent) {
                console.error('Response was already sent.', error);
            } else {
                // @ts-ignore
                task.res.status(500).json({ error: error.message });
            }
        }
    }
}


const lockFreeDevice = (req: LockFreeDeviceRequest, res: Response) => {
    const { user = "", comment = "", status = "locked" } = req.body;
    requestQueue.push({ res, user, comment, status }, (err, device) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (device) {
            res.json({
                // @ts-ignore
                message: `设备 ${device.deviceIp} 由 ${device.user} 锁定.`,
                device,
            });
        }
    });
};

const lockDeviceByIp = async (req: LockDeviceRequest, res: Response): Promise<void> => {
    const { device_ip: deviceIp } = req.params;
    const { user } = req.body;
    try {
        const device: IDevice | null = await deviceService.lockDeviceByIp(deviceIp, user);
        if (!device) {
            res.status(404).json({ error: "未找到设备" });
            return;
        }
        res.json({ message: `设备 ${deviceIp} 由 ${user} 锁定.`, device });
    } catch (error) {
        // @ts-ignore
        res.status(500).json({ error: error.message });
    }
};


const releaseDeviceByIp = async (req: DeviceRequest, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    try {
        const device: IDevice | null = await deviceService.releaseDeviceByIp(deviceIp);
        if (device) {
            res.json({message: `设备 ${deviceIp} 释放成功，设备锁定用时：${device.duration}.`});
            await resolveWaitingRequests();
        } else {
            res.status(404).json({error: '未找到设备'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

const getAllDevices = async (req: Request, res: Response): Promise<void> => {
    try {
        const devices: IDevice[] = await Device.find().lean();
        res.json(devices);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

const addDevice = async (req: DeviceRequest, res: Response): Promise<express.Response<any, Record<string, any>> | undefined> => {
    const {deviceName, deviceMac, deviceIp,} = req.body;
    if (!deviceName || !deviceMac || !deviceIp) {
        return res.status(400).json({error: '设备IP、名称、mac地址是必须的！'});
    }
    try {
        const newDevice = new Device({deviceMac, deviceName, deviceIp});
        await newDevice.save();
        res.status(201).json({message: `设备${deviceMac}添加成功.`, device: newDevice});
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({error: `设备IP(${deviceIp})已存在，请检查是否重复添加。`});
        }
        res.status(500).json({error: error.message});
    }
};

const removeDeviceByIp = async (req: DeviceRequest, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    try {
        const device: IDevice | null = await Device.findOneAndDelete({deviceIp});
        if (device) {
            res.json({message: `设备${deviceIp}已经被移除.`});
        } else {
            res.status(404).json({error: '未找到设备.'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

const updateDevice = async (req: UpdateDeviceRequest, res: Response): Promise<any> => {
    const {device_ip: deviceIp} = req.params;
    const {deviceName, deviceMac, deviceFirmware, user, comment, status} = req.body;

    // Check for the required fields, assuming deviceIp is essential for identifying the device
    if (!deviceIp) {
        return res.status(400).json({error: '设备IP是必须的！'});
    }

    try {
        const updateFields = {
            ...(deviceName && {deviceName}),
            ...(deviceMac && {deviceMac}),
            ...(deviceFirmware && {deviceFirmware}),
            ...(user && {user}),
            ...(comment && {comment}),
            ...(status && {status}),
        };

        // Find the device by IP and update it with new values
        const updatedDevice = await Device.findOneAndUpdate(
            {deviceIp},
            {$set: updateFields},
            {new: true} // This option returns the modified document rather than the original
        );

        if (updatedDevice) {
            res.json({message: `设备${deviceIp}更新成功.`, device: updatedDevice});
        } else {
            res.status(404).json({error: '未找到设备'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};


export {
    lockFreeDevice,
    lockDeviceByIp,
    releaseDeviceByIp,
    getAllDevices,
    addDevice,
    removeDeviceByIp,
    updateDevice
}