import {ObjectId} from "mongoose";

declare global {
    interface IRefreshFirmwareConfig {
        flag: boolean;
        refreshScript: string;
    }

    interface ISwitchFirmwareConfig {
        firmwareList?: Array<{
            fileName: string;
            objectName: string;
        }>;
        switchScript?: string;
        currentObjectName?: string;
    }


    interface IConcurrentTaskService {
        _id?: ObjectId;
        title: string;
        description: string;
        taskType: 'ssh' | 'python' | 'sql' | 'bash';
        script: string;
        environment?: Map<string, string | number>;
        executionPath?: string;
        runtimeEnv?: Map<string, string>;
        status?: 'pending' | 'running' | 'completed' | 'failed';
        createdAt?: Date;
        username?: string;
        stdout?: string[];
        stderr?: string[];
        callbackName?: string;
        exitCode?: number;
        exitSignal?: string;
        error?: string;
        info?: Map<string, string>;
        templateVariables?: Map<string, string>;
    }

    type Status = "locked" | "unlocked" | "maintained"

    interface TestData {
        blob_urls?: string[];
        status?: string;
    }
}

export {};
