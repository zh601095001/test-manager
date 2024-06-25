import {Document} from "mongoose";

interface ISSHConfig {
    port?: number;
    username?: string;
    password?: string;
}

interface IRefreshFirmware {
    flag: boolean;
    refreshScript: string
}

interface ISwitchFirmware {
    firmwareList:  Array<{
        fileName: string;
        objectName: string;
    }>;
    switchScript: string;
    currentFileName: string;
}

interface IDevice extends Document {
    deviceName: string;
    deviceIp: string;
    deviceMac: string | null;
    deviceFirmware: string | null;
    lockTime: Date | null;
    duration: string | null;
    user: string | null;
    comment: string | null;
    status: "locked" | "unlocked" | "maintained";
    updateFirmwareFlag: boolean | null;
    sshConfig: ISSHConfig;
    refreshFirmware: IRefreshFirmware;
    switchFirmware: ISwitchFirmware
}


interface IHarbor extends Document {
    esVersion: string | null
}

export {
    IDevice,
    IHarbor,
    ISSHConfig
}