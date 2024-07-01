// services/ConcurrentTaskService.ts
import {IConcurrentTask} from './types';
import ConcurrentTask from '../models/ConcurrentTask';

interface CreateTaskData extends IConcurrentTask {
    parallel?: number | undefined
}

class ConcurrentTaskService {
    async createTask(data: CreateTaskData): Promise<IConcurrentTask> {
        const {parallel, ...extraData} = data
        if (parallel){
            const tasks = await this.queryTasks({title: data.title, status: {$ne: "completed"}})
            if (tasks.length > parallel) {
                throw Error("超过任务设定最大并行数")
            }
        }
        const task = new ConcurrentTask(data);
        return task.save();
    }

    async getTaskById(taskId: string): Promise<IConcurrentTask | null> {
        return ConcurrentTask.findById(taskId);
    }

    async getAllTasks(): Promise<IConcurrentTask[]> {
        return ConcurrentTask.find({});
    }

    async getTasksByUsernameAndStatus(username: string, status?: string): Promise<IConcurrentTask[]> {
        const query: any = {username};
        if (status) query.status = status;
        return ConcurrentTask.find(query);
    }

    async queryTasks(query: any): Promise<IConcurrentTask[]> {
        return ConcurrentTask.find(query);
    }
}

export default new ConcurrentTaskService();
