import Agenda, {Job, JobAttributes, JobAttributesData,} from 'agenda';
import SequentialTask, {ISequentialTask} from '../models/SequentialTask';
import {executeSSH} from "./taskUtils";
import appConfig from "../config/default";
import {renderScript} from "../utils/utils";

const agenda = new Agenda({
    db: {
        address: appConfig.db.uri,
        collection: 'sequentialAgendaJobs'
    },
    processEvery: '1 second'
});

interface AgendaJob<T extends JobAttributesData> extends Job<T> {
    attrs: JobAttributes<T>;
}

agenda.define('execute task', {concurrency: 1}, async (job: AgendaJob<{
    taskId: string
}>, done: (error?: Error) => void) => {
    const {taskId} = job.attrs.data;
    let task = null
    try {
        task = await SequentialTask.findByIdAndUpdate(taskId, {
            status: 'running',
        });
        if (!task) {
            console.error('Task not found')
            return
        }
        await SequentialTask.findByIdAndUpdate(taskId, {
            script: renderScript(task.templateVariables, task.script)
        })

        console.log(`Executing task: ${task.title}`);
        switch (task.taskType) {
            case 'ssh':
                await executeSSH(task, "sequential");
                break;
            default:
                throw new Error(`Unsupported task type: ${task.taskType}`);
        }
        await SequentialTask.findByIdAndUpdate(taskId, {
            status: 'completed',
        });
        console.log('Task completed successfully');
        done();
    } catch (error: any) {
        console.error(`Error executing task: ${error.message}`);
        if (task) {
            await SequentialTask.findByIdAndUpdate(taskId, {
                status: 'failed',
            });
        }
        done(error);
    }
});

agenda.define('check and schedule tasks', async () => {
    const tasks: ISequentialTask[] = await SequentialTask.find({status: 'pending'});
    tasks.forEach(task => {
        agenda.schedule('in 1 minute', 'execute task', {taskId: task._id.toString()});
        console.log(`Scheduled task ${task._id} for execution.`);
    });
});


export default async function startAgenda() {
    try {
        await agenda.start();
        console.log('Agenda started successfully.');
        await agenda.every('1 second', 'check and schedule tasks');
    } catch (e) {
        console.log(e);
    }
}
