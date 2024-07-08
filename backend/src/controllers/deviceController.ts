import express, {Request, Response} from "express";
import deviceService from "../services/deviceService";
import Device from "../models/Device";
import {findOneAndUpdate, getDateInUTC8} from "../utils/utils";
import ConcurrentTaskService from "../services/concurrentTaskService";
import {fileService} from "../services/fileService";


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
    } catch (error: any) {
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
    try {
        await deviceService.setSshConfig(deviceIp, req.body)
        res.status(200).json({
            message: "SSH configuration updated successfully",
        });
    } catch (e: any) {
        res.status(500).json({message: `Error updating SSH configuration:${e.message}`});
    }
}

const getSshConfig = async (req: setDeviceSshRequest, res: Response) => {
    const {device_ip: deviceIp} = req.params;
    try {
        const sshConfig = await deviceService.getSshConfig(deviceIp)
        res.status(200).json(sshConfig);
    } catch (e: any) {
        res.status(500).json({message: `Error get SSH configuration:${e.message}`});
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
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
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
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
};

const addSwitchFirmwareListItem = async (req: Request, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    const firmwareListItem = req.body;
    try {
        await deviceService.addSwitchFirmwareListItem(deviceIp, firmwareListItem);
        res.status(200).json({
            message: "Add switch firmware list item successfully",
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

const rmSwitchFirmwareListItem = async (req: Request, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    const {objectName} = req.body
    try {
        await deviceService.rmSwitchFirmwareListItem(deviceIp, objectName);
        res.status(200).json({
            message: "Remove switch firmware list item successfully",
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}
const setCurrentSwitchFirmwareListItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const {device_ip: deviceIp} = req.params;
        const {objectName,installFlag} = req.body;
        let message = "切换固件版本成功,请点击安装进行安装并手动重启！"
        if (installFlag){
            const device = await deviceService.getDevice(deviceIp)
            const config = {
                host: deviceIp,
                port: device.sshConfig.port as number,
                username: device.sshConfig.username as string,
                password: device.sshConfig.password as string
            }
            const FILE_URL = await fileService.getFileUrl(objectName, "firmwares")
            const templateVariables = {
                FILE_URL
            }
            const title = `switchFirmware-${deviceIp}`
            await ConcurrentTaskService.createTask({
                title,
                description: "切换固件版本",
                taskType: "ssh",
                script: device.switchFirmware.switchScript,
                templateVariables: new Map(Object.entries(templateVariables)),
                environment: new Map(Object.entries(config)),
                parallel: 1
            })
            message = "正在安装固件中,请前往任务列表查看安装详情。"
        }
        await deviceService.setCurrentSwitchFirmwareListItem(deviceIp, objectName);
        res.status(200).json({
            message: message,
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}
const setSwitchScript = async (req: Request, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    const {switchScript} = req.body;
    try {
        await deviceService.setSwitchScript(deviceIp, switchScript);
        res.status(200).json({
            message: "Set switch firmware script successfully",
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

const getSwitchInfo = async (req: Request, res: Response): Promise<void> => {
    const {device_ip: deviceIp} = req.params;
    try {
        const switchInfo = await deviceService.getSwitchInfo(deviceIp);
        res.status(200).json(switchInfo)
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

export {
    lockFreeDevice,
    lockDeviceByIp,
    releaseDeviceByIp,
    getAllDevices,
    addDevice,
    removeDeviceByIp,
    updateDevice,
    setSshConfig,
    getSshConfig,
    setRefreshFirmware,
    setSwitchFirmware,
    addSwitchFirmwareListItem,
    rmSwitchFirmwareListItem,
    setCurrentSwitchFirmwareListItem,
    setSwitchScript,
    getSwitchInfo
}