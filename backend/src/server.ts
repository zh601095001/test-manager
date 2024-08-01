/// <reference path="./types/global.d.ts" />
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.join(__dirname, '.env')
});

import express from "express";
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import mongoose from 'mongoose';
import config from './config';
import devicesRoutes from './routes/devicesRoutes';
import deviceRoute from "./routes/deviceRoute";
import {handleUpgrade} from './controllers/wsController';
import passport from "passport";
import userRouters from "./routes/userRouters";
import cookieParser from 'cookie-parser';
import fileRoutes from "./routes/fileRoutes";
import reportRoutes from "./routes/reportRoutes";
import htmlReportRoutes from "./routes/htmlReportRoutes";
import testEntryRoutes from "./routes/testEntryRoutes";
import bodyParser from "body-parser";
import reportSummaryRoutes from "./routes/reportSummaryRoutes";
import morgan from "morgan"
import runTask from "./schedulers/tasks"
import emailRoutes from "./routes/emailRoutes";
import harborRoutes from "./routes/harborRoutes";
import concurrentTaskRoutes from "./routes/concurrentTaskRoutes";
import {errorHandler} from "./errorHandler/errorHandler";
import initializeTasks from "./schedulers/concurrentTask";
import {initializeDeviceSettings} from "./services/devicesSettingService";
import deviceSettingsRoutes from "./routes/deviceSettingsRoutes";
import gitlabRunnerRoutes from "./routes/gitlabRunnerRoutes";
import integrationRoutes from "./routes/integrationRoutes";
import emailSettingsRoutes from "./routes/emailSettingsRoutes";

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json({limit: '1000mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '1000mb'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
config.passport(passport)
app.use(passport.initialize());
app.use(reportRoutes);
app.use(htmlReportRoutes)
console.log(`Connecting to ${config.db.uri}`)
// @ts-ignore
app.use('/reports', express.static('uploads'));
const swaggerDocs = swaggerJsDoc(config.swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/devices', devicesRoutes);
app.use("/device", deviceRoute);
app.use("/", userRouters)
app.use('/files', fileRoutes);
app.use(testEntryRoutes)
app.use(reportSummaryRoutes)
app.use(emailRoutes);
app.use(harborRoutes)
app.use("/concurrent", concurrentTaskRoutes)
app.use("/device-settings", deviceSettingsRoutes)
app.use(gitlabRunnerRoutes)
app.use(integrationRoutes)
app.use(emailSettingsRoutes)
app.use(errorHandler);
mongoose.connect(config.db.uri,)
    .then(() => {
        console.log('MongoDB connected')
        const server = app.listen(8080, "0.0.0.0", () => console.log('Server is running on http://localhost:8080'));
        handleUpgrade(server);
        initializeTasks()
        runTask()
        initializeDeviceSettings().catch((err: Error) => {
            console.error(err)
        })
        console.log("如报错，请检查mongodb、redis、minio连接是否正确...")
    })
    .catch(err => console.error('MongoDB connection error:', err));
