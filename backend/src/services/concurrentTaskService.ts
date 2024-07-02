// services/ConcurrentTaskService.ts
import {IConcurrentTask} from './types';
import ConcurrentTask from '../models/ConcurrentTask';

interface CreateTaskData extends IConcurrentTask {
    parallel?: number | undefined
}

class ConcurrentTaskService {
    async createTask(data: CreateTaskData): Promise<IConcurrentTask> {
        const {parallel, ...extraData} = data
        if (parallel) {
            const tasks = await this.queryTasks({title: data.title, status: { $nin: ["completed", "failed"]}})
            if (tasks.length >= parallel) {
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

    async getTasks({title, limit = 10, offset = 0, status, onlyCount = false}: {
        title: string,
        limit?: number,
        offset?: number,
        status?: string,
        onlyCount?: boolean // 新增参数来决定是否只返回数量
    }) {
        const query: any = {
            title: new RegExp(title, 'i') // 'i' 用于不区分大小写的搜索
        };

        if (status) {
            query['status'] = status; // 只有在 status 非空时才添加到查询条件中
        }

        if (onlyCount) {
            const count = await ConcurrentTask.countDocuments(query); // 如果 onlyCount 为真，返回符合条件的文档数量
            return {count, status}
        } else {
            return ConcurrentTask.find(query) // 否则，返回任务列表
                .sort({createdAt: -1})
                .limit(limit)
                .skip(offset);
        }
    }
}

export default new ConcurrentTaskService();
