// controllers/ConcurrentTaskController.ts
import {Request, Response} from 'express';
import ConcurrentTaskService from '../services/concurrentTaskService';


class ConcurrentTaskController {
    async createTask(req: Request, res: Response): Promise<void> {
        try {
            const task = await ConcurrentTaskService.createTask(req.body);
            res.status(201).json(task);
        } catch (error: any) {
            res.status(400).json({message: error.message});
        }
    }

    async getTask(req: Request, res: Response): Promise<void> {
        try {
            const task = await ConcurrentTaskService.getTaskById(req.params.id);
            if (!task) {
                res.status(404).json({message: 'Task not found'});
                return;
            }
            res.json(task);
        } catch (error: any) {
            res.status(500).json({message: error.message});
        }
    }

    async getAllTasks(req: Request, res: Response): Promise<void> {
        try {
            const tasks = await ConcurrentTaskService.getAllTasks();
            res.json(tasks);
        } catch (error: any) {
            res.status(500).json({message: error.message});
        }
    }

    async getTasksByUsernameAndStatus(req: Request, res: Response): Promise<void> {
        try {
            const {username} = req.params;
            const {status} = req.query as { status?: string };
            const tasks = await ConcurrentTaskService.getTasksByUsernameAndStatus(username, status);
            res.json(tasks);
        } catch (error: any) {
            res.status(500).json({message: error.message});
        }
    }
}

export default new ConcurrentTaskController();
