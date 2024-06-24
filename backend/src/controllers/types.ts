import {Request, Response} from "express";

interface LockFreeDeviceRequest extends Request {
    body: {
        user?: string;
        comment?: string
        status?: "locked" | "unlocked" | "maintained",
        deviceName?: string
    };
}

interface LockDeviceRequest extends Request {
    params: {
        device_ip: string;
    };
    body: {
        user: string;
    };
}

interface DeviceRequest extends Request {
    params: {
        device_ip: string;
    };
    body: {
        deviceIp?: string;
        deviceMac?: string;
        deviceName?: string;
        force?: boolean
    };
}

interface UpdateDeviceRequest extends Request {
    params: {
        device_ip: string;  // Used for identifying the device in routes that use a URL parameter
    };
    body: {
        deviceIp?: string;       // Optional new IP address for the device
        deviceMac?: string;      // Optional new MAC address for the device
        deviceName?: string;     // Optional new name for the device
        deviceFirmware?: string; // Optional firmware version
        user?: string;           // Optional associated user
        comment?: string;        // Optional comment about the device
        status?: "locked" | "unlocked" | "maintained"; // Optional status of the device
        lockTime?: Date | string;  // Optional lock time, could be Date or string depending on how you handle dates
        duration?: string;      // Optional duration for how long the device has been locked
        updateFirmwareFlag?: boolean
    };
}


interface Task {
    user: string;
    comment: string;
    status: "locked" | "unlocked" | "maintained" | undefined;
    res: Response;
}

interface setDeviceSshRequest extends Request {
    params: {
        device_ip: string;
    };
    body: {
        port?: number;
        username?: string;
        password?: string;
    };
}

export {
    LockFreeDeviceRequest,
    LockDeviceRequest,
    DeviceRequest,
    UpdateDeviceRequest,
    setDeviceSshRequest,
    Task
}