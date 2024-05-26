import express, {Request, Response} from "express";
import * as deviceService from "../services/deviceService";
import async from "async";
import Device from "../models/Device";
import {DeviceRequest, LockDeviceRequest, LockFreeDeviceRequest, Task, UpdateDeviceRequest} from "./types";
import {IDevice} from "../models/types";

const waitingQueue: Task[] = [];


const requestQueue = async.queue(async (task: Task, callback: () => void) => {
    try {
        const device: IDevice | null = await deviceService.getFreeDevice(task.status || "locked");
        if (device) {
            device.user = task.user;
            device.comment = task.comment
            // @ts-ignore
            device.status = task.status
            await device.save();
            task.res.json({
                message: `设备 ${device.deviceIp} 由 ${device.user} 锁定.`,
                device,
            });
        } else {
            waitingQueue.push(task); // 这里假设 waitingQueue 已经定义
        }
    } catch (error: any) { // 捕获所有类型的错误
        task.res.status(500).json({error: error.message});
    }
    callback();
}, 1);


async function resolveWaitingRequests(): Promise<void> {
    while (waitingQueue.length > 0) {
        const device: IDevice | null = await deviceService.getFreeDevice();
        if (device) {
            const task = waitingQueue.shift();
            device.user = task?.user || null;
            // @ts-ignore
            device.comment = task.comment
            // @ts-ignore
            device.status = task.status
            await device.save();
            if (task?.res) {
                task.res.json({
                    message: `设备 ${device.deviceIp} 由 ${device.user} 锁定.`,
                    device,
                });
            }
        } else {
            break;
        }
    }
}


const lockFreeDevice = (req: LockFreeDeviceRequest, res: Response) => {
    let {user, comment, status} = req.body;
    if (!user) {
        user = "";
    }
    if (!comment) {
        comment = ""
    }
    if (!status) {
        status = "locked"
    }
    return requestQueue.push({res, user, comment, status});
};


const lockDeviceByIp = async (req: LockDeviceRequest, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    const {user} = req.body;
    try {
        const device: IDevice | null = await deviceService.lockDeviceByIp(deviceIp, user);
        if (device) {
            res.json({message: `设备 ${deviceIp} 由 ${user} 锁定.`, device});
        } else {
            res.status(404).json({error: "未找到设备"});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
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