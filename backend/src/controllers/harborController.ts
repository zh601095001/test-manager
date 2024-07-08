import {Request, Response} from "express";
import harborService from "../services/harborService";

const getAllHarbors = async (req: Request, res: Response) => {
    const allHarbors = await harborService.getAllHarbors()
    return res.json(allHarbors);
}

const getHarbor = async (req: Request, res: Response) => {
    const {image_name} = req.params;
    const harbor = await harborService.getHarbor(image_name)
    return res.json(harbor);
}

const updateHarbor = async (req: Request, res: Response) => {
    const {image_name} = req.params;
    const {data} = req.body;
    const result = await harborService.updateHarbor(image_name, data)
    res.json(result);
}

export default {
    getAllHarbors,
    updateHarbor,
    getHarbor
}