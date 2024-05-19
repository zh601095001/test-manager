import {Request, Response} from "express";

interface LockFreeDeviceRequest extends Request {
    body: {
        purpose?: string;
    };
}

interface LockDeviceRequest extends Request {
    params: {
        ip: string;
    };
    body: {
        purpose: string;
    };
}

interface DeviceRequest extends Request {
    params: {
        ip: string;
    };
    body: {
        ip?: string;
        name?: string;
    };
}

interface Task {
    purpose: string;
    res: Response;
}

export {
    LockFreeDeviceRequest,
    LockDeviceRequest,
    DeviceRequest,
    Task
}