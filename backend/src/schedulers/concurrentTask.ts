import {Worker, Queue, Job} from 'bullmq';
import IORedis from 'ioredis';
import ConcurrentTask from "../models/ConcurrentTask";
import {executeSSH} from "./taskUtils";
import {renderScript} from "../utils/utils";
import appConfig from "../config/default";
import callbacks from "./callbacks";

const connection = new IORedis(appConfig.redis.uri, {
    maxRetriesPerRequest: null // 确保设置为 null
});
const queueName = 'taskQueue';
const taskQueue = new Queue(queueName, {connection});
const workers = []
const initializeTasks = () => {
    for (let i = 0; i < 20; i++) {
        const worker = new Worker(queueName, async (job: Job) => {
            const taskId = job.data.taskId;
            let task = null;
            try {
                task = await ConcurrentTask.findById(taskId);
                if (!task) {
                    console.error('Task not found');
                    return;
                }
                await ConcurrentTask.findByIdAndUpdate(taskId, {
                    script: renderScript(task.templateVariables, task.script)
                });
                switch (task.taskType) {
                    case 'ssh':
                        await executeSSH(task, "concurrent");
                        break;
                    default:
                        throw new Error(`Unsupported task type: ${task.taskType}`);
                }
            } catch (error: any) {
                console.error(`Error executing task: ${error.message}`);
                await ConcurrentTask.findByIdAndUpdate(taskId, {
                    status: 'failed',
                });
            } finally {
                if (task && task.callbackName) {
                    await callbacks[task.callbackName](task, ConcurrentTask);
                }
            }
        }, {connection});
        workers.push(worker)
    }
    setInterval(async () => {
        const task = await ConcurrentTask.findOneAndUpdate({status: 'pending'}, {status: "running"});
        if (task) {
            await taskQueue.add('execute task', {taskId: task._id.toString()});
        }
    }, 100);

    setInterval(async () => {
        await taskQueue.clean(5000, 100, 'completed');
        await taskQueue.clean(5000, 100, 'failed');
        console.log(`Old jobs cleaned up`);
    }, 86400000); // 每天执行一次

    console.log('BullMQ tasks management initialized.');
}
export default initializeTasks