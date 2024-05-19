import {Document} from "mongoose";

interface IDevice extends Document {
    ip: string;
    name: string;
    locked: boolean;
    lockStartTime: Date | null;
    lockDuration: string | null;
    purpose: string | null;
    lockedDuration: string | null;
}

export {
    IDevice
}