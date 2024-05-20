import express from "express";
import path from 'path';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import mongoose from 'mongoose';
import config from './config/default';
import deviceRoutes from './routes/deviceRoutes';
import { handleUpgrade } from './routes/wsRoutes';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// @ts-ignore
mongoose.connect(config.db.uri, )
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const swaggerDocs = swaggerJsDoc(config.swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/devices', deviceRoutes);

// 创建 HTTP 服务器并传递给 WebSocket 处理
const server = app.listen(8080, () => console.log('Server is running on http://localhost:8080'));

handleUpgrade(server);
