// services/ConcurrentTaskService.ts
import {IConcurrentTask} from './types';
import ConcurrentTask from '../models/ConcurrentTask';

class ConcurrentTaskService {
    async createTask(data: IConcurrentTask): Promise<IConcurrentTask> {
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
