import express, {Request, Response} from "express";
import * as deviceService from "../services/deviceService";
import async from "async";
import Device from "../models/deviceModel";
import {DeviceRequest, LockDeviceRequest, LockFreeDeviceRequest, Task} from "./types";
import {IDevice} from "../models/types";

const waitingQueue: Task[] = [];


const requestQueue = async.queue(async (task: Task, callback: () => void) => {
    try {
        const device: IDevice | null = await deviceService.getFreeDevice();
        if (device) {
            device.purpose = task.purpose;
            await device.save();
            task.res.json({
                message: `设备 ${device.ip} 由 ${device.purpose} 锁定.`,
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
            device.purpose = task?.purpose || null;
            await device.save();
            if (task?.res) {
                task.res.json({
                    message: `设备 ${device.ip} 由 ${device.purpose} 锁定.`,
                    device,
                });
            }
        } else {
            break;
        }
    }
}


const lockFreeDevice = (req: LockFreeDeviceRequest, res: Response) => {
    let {purpose} = req.body;
    if (!purpose) {
        purpose = "";
    }
    return requestQueue.push({res, purpose});
};


const lockDeviceByIp = async (req: LockDeviceRequest, res: Response): Promise<void> => {
    const {ip} = req.params;
    const {purpose} = req.body;
    try {
        const device: IDevice | null = await deviceService.lockDeviceByIp(ip, purpose);
        if (device) {
            res.json({message: `设备 ${ip} 由 ${purpose} 锁定.`, device});
        } else {
            res.status(404).json({error: "未找到设备"});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};


const releaseDeviceByIp = async (req: DeviceRequest, res: Response): Promise<void> => {
    const {ip} = req.params;
    try {
        const device: IDevice | null = await deviceService.releaseDeviceByIp(ip);
        if (device) {
            res.json({message: `设备 ${ip} 释放成功，设备锁定用时：${device.lockedDuration}.`});
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
    const {ip, name} = req.body;
    if (!ip || !name) {
        return res.status(400).json({error: '设备IP和名称是必须的！'});
    }
    try {
        const newDevice = new Device({ip, name});
        await newDevice.save();
        res.status(201).json({message: `设备${ip}添加成功.`, device: newDevice});
    } catch (error: any) {
        res.status(400).json({error: error.message});
    }
};

const removeDeviceByIp = async (req: DeviceRequest, res: Response): Promise<void> => {
    const {ip} = req.params;
    try {
        const device: IDevice | null = await Device.findOneAndDelete({ip});
        if (device) {
            res.json({message: `设备${ip}已经被移除.`});
        } else {
            res.status(404).json({error: '未找到设备.'});
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
    removeDeviceByIp
}