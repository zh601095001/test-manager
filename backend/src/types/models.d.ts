import {Document, ObjectId} from "mongoose";

declare global {
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
        firmwareList: Array<{
            fileName: string;
            objectName: string;
        }>;
        switchScript: string;
        currentObjectName: string;
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

    interface IDeviceSettings extends Document {
        firmwareList: Array<{
            fileName: string;
            objectName: string;
        }>;
        switchScript: string;
    }

    interface IHarbor extends Document {
        esVersion: string | null
    }

    interface IConcurrentTask extends Document {
        _id: ObjectId;
        title: string;
        description: string;
        taskType: 'ssh' | 'python' | 'sql' | 'bash';
        script: string;
        environment: Map<string, string | number>;
        executionPath: string;
        runtimeEnv: Map<string, string>;
        status: 'pending' | 'running' | 'completed' | 'failed';
        createdAt: Date;
        username: string;
        stdout: string[];
        stderr: string[];
        callbackName?: string;
        exitCode: number;
        exitSignal: string;
        error: string;
        info: Map<string, string>;
        templateVariables: Map<string, string>;
    }

    interface ITestReport {
        test_id: string;
        config?: any; // 如果 config 结构是固定的，可以具体定义它的类型
        suites?: any[]; // 同样，如果 suites 的结构是已知的，可以更详细地定义类型
        stats?: {
            duration?: number;
            expected?: number;
            unexpected?: number;
            skipped?: number;
            flaky?: number;
            [key: string]: any; // 如果有其他统计数据，可以添加更多可选属性
        };
    }

    interface IUser extends Document {
        username: string;
        password: string;
        roles: string[];
        refreshToken: string | null;
        email: string | null;
        avatar: string;
        settings: {
            deviceFilter: string[];
        }
    }

    interface IGitlabRunner extends Document {
        runnerName: string;
        runnerIp: string;
        runnerPort: number;
        status?: "pause" | "enable";
        tags: string[];
        comment?: string;
        sshConfig?: {
            username: string;
            password: string;
        };
    }
}

export {};
