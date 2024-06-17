import {Router} from "express";
import harborController from "../controllers/harborController";

const router = Router();

router.get("/harbors", harborController.getAllHarbors)

router.post("/harbor/:image_name", harborController.updateHarbor)

export default router