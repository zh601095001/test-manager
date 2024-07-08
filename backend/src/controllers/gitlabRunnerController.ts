import {Request, Response} from 'express';
import * as gitlabRunnerService from '../services/gitlabRunnerService';

export const createGitlabRunner = async (req: Request, res: Response): Promise<void> => {
    try {
        const runner = await gitlabRunnerService.createGitlabRunner(req.body);
        res.status(201).json(runner);
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

export const getAllGitlabRunners = async (req: Request, res: Response): Promise<void> => {
    try {
        const runners = await gitlabRunnerService.getAllGitlabRunners();
        res.status(200).json(runners);
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

export const getGitlabRunnerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const runner = await gitlabRunnerService.getGitlabRunnerById(req.params.id);
        if (!runner) {
            res.status(404).json({message: 'Gitlab Runner not found'});
        } else {
            res.status(200).json(runner);
        }
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

export const updateGitlabRunner = async (req: Request, res: Response): Promise<void> => {
    try {
        const runner = await gitlabRunnerService.updateGitlabRunner(req.params.id, req.body);
        if (!runner) {
            res.status(404).json({message: 'Gitlab Runner not found'});
        } else {
            res.status(200).json(runner);
        }
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

export const deleteGitlabRunner = async (req: Request, res: Response): Promise<void> => {
    try {
        const runner = await gitlabRunnerService.deleteGitlabRunner(req.params.id);
        if (!runner) {
            res.status(404).json({message: 'Gitlab Runner not found'});
        } else {
            res.status(204).json();
        }
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};
