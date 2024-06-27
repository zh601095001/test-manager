import Agenda, {Job, JobAttributes, JobAttributesData,} from 'agenda';
import SequentialTask, {ISequentialTask} from '../models/SequentialTask';  // Adjust according to your actual model path

const agenda = new Agenda({processEvery: '1 second'});

interface AgendaJob<T extends JobAttributesData> extends Job<T> {
    attrs: JobAttributes<T>;
}

agenda.define('execute task', {concurrency: 1}, async (job: AgendaJob<{
    taskId: string
}>, done: (error?: Error) => void) => {
    const {taskId} = job.attrs.data;
    let task = null
    try {
        task = await SequentialTask.findById(taskId);
        if (!task) {
            console.error('Task not found')
            return
        }

        console.log(`Executing task: ${task.description}`);
        switch (task.taskType) {
            case 'ssh':
                await executeSSH(task);
                break;
            case 'python':
            case 'bash':
                await executeScript(task);
                break;
            default:
                task.status = 'failed'
                await task.save();
                throw new Error(`Unsupported task type: ${task.taskType}`);
        }

        task.status = 'completed';
        await task.save();
        console.log('Task completed successfully');
        done();
    } catch (error: any) {
        console.error(`Error executing task: ${error.message}`);
        if (task) {
            task.status = 'failed';
            await task.save();
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

async function executeSSH(task: ISequentialTask) {
    console.log(`Executing SSH command on ${task.environment?.host}`);
}

async function executeScript(task: ISequentialTask) {
    console.log(`Executing ${task.taskType} script: ${task.script}`);
}

export async function startAgenda() {
    try {
        await agenda.start();
        console.log('Agenda started successfully.');
        await agenda.every('1 second', 'check and schedule tasks');
    } catch (e) {
        console.log(e);
    }
}
