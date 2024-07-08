import ConcurrentTask from "../models/ConcurrentTask";
import {SSHStream} from "../utils/utils";
import mongoose from "mongoose";

export async function executeSSH(_task: IConcurrentTask, type: "concurrent" | "sequential") {
    const taskId = _task._id;
    const models: Record<any, mongoose.Model<any>> = {
        "concurrent": ConcurrentTask,
    };
    const currentModel = models[type];
    const task = await currentModel.findById(taskId) as IConcurrentTask;
    const {runtimeEnv, executionPath, script} = task;
    const environment = task.environment as Map<string, string | number>;
    const host = environment.get("host") as string;
    const port = environment.get("port") as number;
    const username = environment.get("username") as string;
    const password = environment.get("password") as string;
    const sshStream = new SSHStream();
    let _resolve: any, _reject: any;
    const promise = new Promise((resolve, reject) => {
        _resolve = resolve;
        _reject = reject;
    });

    sshStream.on('ready', () => {
        console.log("SSH connection successfully established.");
    });

    sshStream.on('data', async (line: string) => {
        await currentModel.findByIdAndUpdate(taskId, {$push: {stdout: line}});
    });

    sshStream.on('stderr', async (line: string) => {
        await currentModel.findByIdAndUpdate(taskId, {$push: {stderr: line}});
    });

    sshStream.on('close', async ({code, signal}) => {
        if (code === 0) {
            await currentModel.findByIdAndUpdate(taskId, {status: 'completed'});
            _resolve();
        } else {
            await currentModel.findByIdAndUpdate(taskId, {status: 'failed', exitCode: code, exitSignal: signal});
            _reject(new Error(`SSH closed with code ${code} and signal ${signal}`));
        }
    });

    sshStream.on('error', async (error: Error) => {
        console.error(`SSH error: ${error.message}`);
        await currentModel.findByIdAndUpdate(taskId, {status: 'failed', error: error.message});
        _reject(error);
    });

    sshStream.execute({
        host,
        port,
        username,
        password,
        runtimeEnv,
        executionPath,
    },script);

    return promise;
}
