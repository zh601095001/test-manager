import ConcurrentTask, {IConcurrentTask} from "../models/ConcurrentTask";
import {SSHStream} from "../utils/utils";
import SequentialTask, {ISequentialTask} from "../models/SequentialTask";
import mongoose from "mongoose";

export async function executeSSH(_task: IConcurrentTask | ISequentialTask, type: "concurrent" | "sequential") {
    const taskId = _task._id
    const models: Record<any, mongoose.Model<any>> = {
        "concurrent": ConcurrentTask,
        "sequential": SequentialTask,
    }
    const currentModel = models[type]
    const task = await currentModel.findById(taskId) as IConcurrentTask | ISequentialTask;
    const {runtimeEnv, executionPath, script} = task
    const environment = task.environment as Map<string, string | number>
    const host = environment.get("host") as string
    const port = environment.get("port") as number
    const username = environment.get("username") as string
    const password = environment.get("password") as string
    const sshStream = new SSHStream()
    let _resolve: any, _reject: any
    const promise = new Promise((resolve, reject) => {
        _resolve = resolve
        _reject = reject
    })
    sshStream.on('ready', () => {
    });
    sshStream.on('data', async (line: string) => {
        await currentModel.findByIdAndUpdate(taskId, {$push: {stdout: line}})
    });
    sshStream.on('stderr', async (line: string) => {
        await currentModel.findByIdAndUpdate(taskId, {$push: {stderr: line}})
    });
    sshStream.on('close', async ({code, signal}) => {
        await currentModel.findByIdAndUpdate(task._id, {
            exitCode: code,
            exitSignal: signal
        });
        _resolve()
    });
    sshStream.on('error', async (error: string) => {
        await currentModel.findByIdAndUpdate(task._id, {error: error});
        _reject()
    });
    sshStream.execute({
        host,
        port,
        username,
        password,
        runtimeEnv,
        executionPath
    }, script);
    return promise
}