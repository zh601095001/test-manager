import express, {Request, Response} from "express";
import harborService from "../services/harborService";

const getAllHarbors = async (req: Request, res: Response) => {
    const allHarbors = harborService.getAllHarbors()
    return res.json(allHarbors);
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
}