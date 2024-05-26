import {Document} from "mongoose";

interface IDevice extends Document {
    deviceName: string;
    deviceIp: string;
    deviceMac: string | null;
    deviceFirmware: string | null;
    lockTime: Date | null;
    duration: string | null;
    user: string | null;
    comment: string | null;
    status: "locked"| "unlocked"|"maintained";
}

export {
    IDevice
}