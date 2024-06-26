export interface IRefreshFirmwareConfig {
    flag: boolean;
    refreshScript: string;
}

export interface ISwitchFirmwareConfig {
    firmwareList?: Array<{
        fileName: string;
        objectName: string;
    }>;
    switchScript?: string;
    currentObjectName?: string;
}

export type Status = "locked" | "unlocked" | "maintained"
