import Agenda, {Job, JobAttributes, JobAttributesData,} from 'agenda';
import ConcurrentTask, {IConcurrentTask} from "../models/ConcurrentTask";
import callbacks from "./callbacks";
import {executeSSH} from "./taskUtils";
import appConfig from "../config/default";
import SequentialTask from "../models/SequentialTask";
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
        task = await ConcurrentTask.findByIdAndUpdate(taskId, {
            status: 'running',
        });
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
        if (task.callbackName) {
            await callbacks[task.callbackName](task, ConcurrentTask);
        }
        await ConcurrentTask.findByIdAndUpdate(taskId, {
            status: 'completed',
        });
        done();
    } catch (error: any) {
        console.error(`Error executing task: ${error.message}`);
        if (task) {
            await ConcurrentTask.findByIdAndUpdate(taskId, {
                status: 'failed',
            });
        }
        done(error);
    }
});

agenda.define('check and schedule tasks', async () => {
    const tasks: IConcurrentTask[] = await ConcurrentTask.find({status: 'pending'});
    tasks.forEach(task => {
        agenda.now('execute task', {taskId: task._id.toString()});
    });
});


export default async function startAgenda() {
    try {
        await agenda.start();
        console.log('Concurrent Agenda started successfully.');
        await agenda.every('1 second', 'check and schedule tasks');
    } catch (e) {
        console.log(e);
    }
}
