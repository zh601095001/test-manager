import express, {Request, Response} from "express";
import deviceService from "../services/deviceService";
import Device from "../models/Device";
import {
    DeviceRequest,
    LockDeviceRequest,
    LockFreeDeviceRequest,
    setDeviceSshRequest,
    Task,
    UpdateDeviceRequest
} from "./types";
import {IDevice} from "../models/types";
import {findOneAndUpdate, getDateInUTC8} from "../utils/utils";


const lockFreeDevice = async (req: LockFreeDeviceRequest, res: Response) => {
    const {user = "", comment = "", status = "locked", deviceName = "T320"} = req.body;
    const device = await findOneAndUpdate(Device, {
            deviceName: new RegExp(deviceName, "i"),
            status: "unlocked"
        }, {
            status,
            comment,
            user,
            lockTime: getDateInUTC8()
        }, {
            delay: 2000
        },
        req
    )
    res.json({
        message: `设备 ${device?.deviceIp} 由 ${device?.user} 锁定.`,
        device
    })
};

const lockDeviceByIp = async (req: LockDeviceRequest, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    const {user} = req.body;
    try {
        const device: IDevice | null = await deviceService.lockDeviceByIp(deviceIp, user);
        if (!device) {
            res.status(404).json({error: "未找到设备"});
            return;
        }
        res.json({message: `设备 ${deviceIp} 由 ${user} 锁定.`, device});
    } catch (error) {
        // @ts-ignore
        res.status(500).json({error: error.message});
    }
};


const releaseDeviceByIp = async (req: DeviceRequest, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    const {force = true} = req.body;
    try {
        const device: IDevice | null = await deviceService.releaseDeviceByIp(deviceIp, force);
        if (device) {
            res.json({message: `设备 ${deviceIp} 释放成功，设备锁定用时：${device.duration}.`});
            // await resolveWaitingRequests();
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
    const {deviceName, deviceMac, deviceFirmware, user, comment, status, updateFirmwareFlag} = req.body;

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
            ...(updateFirmwareFlag && {updateFirmwareFlag})
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

const setSshConfig = async (req: setDeviceSshRequest, res: Response) => {
    const {device_ip: deviceIp} = req.params;
    try{
        await deviceService.setSshConfig(deviceIp, req.body)
        res.status(200).json({
            message: "SSH configuration updated successfully",
        });
    }catch (e){
        // @ts-ignore
        res.status(500).json({ message: `Error updating SSH configuration:${e.message}` });
    }
}

const setRefreshFirmware = async (req: Request, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    const refreshConfig = req.body;
    try {
        await deviceService.setRefreshFirmware(deviceIp, refreshConfig);
        res.status(200).json({
            message: "RefreshFirmware configuration updated successfully",
        });
    } catch (error) {
        // @ts-ignore
        res.status(500).send(error.message);
    }
};

const setSwitchFirmware = async (req: Request, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    const firmwareData = req.body;
    try {
        await deviceService.setSwitchFirmware(deviceIp, firmwareData);
        res.status(200).json({
            message: "SwitchFirmware configuration updated successfully",
        });
    } catch (error) {
        // @ts-ignore
        res.status(500).send(error.message);
    }
};


export {
    lockFreeDevice,
    lockDeviceByIp,
    releaseDeviceByIp,
    getAllDevices,
    addDevice,
    removeDeviceByIp,
    updateDevice,
    setSshConfig,
    setRefreshFirmware,
    setSwitchFirmware
}