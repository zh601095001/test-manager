import Agenda, {Job, JobAttributes, JobAttributesData,} from 'agenda';
import ConcurrentTask, {IConcurrentTask} from "../models/ConcurrentTask";
import callbacks from "./callbacks";
import {executeSSH} from "./taskUtils";
import appConfig from "../config/default";
import {renderScript} from "../utils/utils";

const agenda = new Agenda({
    db: {
        address: appConfig.db.uri,
        collection: 'concurrentAgendaJobs'
    },
    processEvery: '1 second'
});

interface AgendaJob<T extends JobAttributesData> extends Job<T> {
    attrs: JobAttributes<T>;
}

agenda.define('execute task', {concurrency: 20}, async (job: AgendaJob<{
    taskId: string
}>, done: (error?: Error) => void) => {
    const {taskId} = job.attrs.data;
    let task = null
    try {
        task = await ConcurrentTask.findById(taskId);
        if (!task) {
            console.error('Task not found')
            return
        }
        await ConcurrentTask.findByIdAndUpdate(taskId, {
            script: renderScript(task.templateVariables, task.script)
        })
        switch (task.taskType) {
            case 'ssh':
                await executeSSH(task, "concurrent");
                break;
            default:
                throw new Error(`Unsupported task type: ${task.taskType}`);
        }

        await ConcurrentTask.findByIdAndUpdate(taskId, {
            status: 'completed',
        });
        done();
    } catch (error: any) {
        console.error(`Error executing task: ${error.message}`);
        await ConcurrentTask.findByIdAndUpdate(taskId, {
            status: 'failed',
        });
        done(error);
    } finally {
        if (task && task.callbackName) {
            await callbacks[task.callbackName](task, ConcurrentTask);
        }
    }
});

agenda.define('check and schedule tasks', async () => {
    const task: IConcurrentTask | null = await ConcurrentTask.findOneAndUpdate({status: 'pending'}, {status: "running"});
    if (task) {
        await agenda.now('execute task', {taskId: task._id.toString()});
    }
});

agenda.define('cleanup old jobs', async () => {
    const daysToKeep = 1; // 定义保留任务的天数
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    // @ts-ignore
    const { deletedCount } = await agenda.cancel({
        'lastFinishedAt': { $lt: cutoff },
        '$or': [{ 'lastRunAt': { $exists: false } }, { 'lastRunAt': { $lt: cutoff } }]
    });

    console.log(`Deleted ${deletedCount} old jobs`);
});


export default async function startAgenda() {
    try {
        await agenda.start();
        console.log('Concurrent Agenda started successfully.');
        setInterval(async () => {
            await agenda.now('check and schedule tasks', {});
        }, 100);
        await agenda.every('1 day', 'cleanup old jobs');
        // await agenda.every('1 second', 'check and schedule tasks');
    } catch (e) {
        console.log(e);
    }
}
