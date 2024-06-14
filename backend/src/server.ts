import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.join(__dirname, '.env')
});

import express from "express";
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import mongoose from 'mongoose';
import config from './config/default';
import deviceRoutes from './routes/deviceRoutes';
import {handleUpgrade} from './routes/wsRoutes';
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

app.use('/devices', deviceRoutes);
app.use(userRouters)
app.use('/files', fileRoutes);
app.use(testEntryRoutes)
app.use(reportSummaryRoutes)
app.use(emailRoutes);


mongoose.connect(config.db.uri,)
    .then(() => {
        console.log('MongoDB connected')
        const server = app.listen(8080, "0.0.0.0", () => console.log('Server is running on http://localhost:8080'));
        handleUpgrade(server);
        runTask()
    })
    .catch(err => console.error('MongoDB connection error:', err));
