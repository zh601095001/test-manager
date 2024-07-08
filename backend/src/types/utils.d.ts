import {ConnectConfig} from "ssh2";
import mongoose from "mongoose";

declare global {
    interface SSHResult {
        stdout: string;
        stderr: string;
        code: number | null;
        signal: string | null;
        error: string | null;
    }

    interface Config extends ConnectConfig {
        executionPath?: string
        runtimeEnv?: Map<string, string>
    }

    interface UpdateOptions extends mongoose.QueryOptions {
        delay?: number;  // Optional delay between retries
    }
}

export {};
