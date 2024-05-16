const express = require('express');
const async = require('async');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // 提供静态文件

// 配置 Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Device Management API',
            version: '1.0.0',
            description: 'API for managing device pool with locking and unlocking features'
        }
    },
    apis: ['./server.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 示例设备池
let devicePool = [
    {
        ip: '192.168.0.1',
        name: 'Device 1',
        locked: false,
        lockStartTime: null,
        lockDuration: null,
        lockedDuration: null,
        purpose: null
    },
    {
        ip: '192.168.0.2',
        name: 'Device 2',
        locked: false,
        lockStartTime: null,
        lockDuration: null,
        lockedDuration: null,
        purpose: null
    },
    {
        ip: '192.168.0.3',
        name: 'Device 3',
        locked: false,
        lockStartTime: null,
        lockDuration: null,
        lockedDuration: null,
        purpose: null
    },
    {
        ip: '192.168.0.4',
        name: 'Device 4',
        locked: false,
        lockStartTime: null,
        lockDuration: null,
        lockedDuration: null,
        purpose: null
    }
];

// 等待队列
const waitingQueue = [];

// 请求队列
const requestQueue = async.queue((task, callback) => {
    const freeDevices = devicePool.filter(d => !d.locked);

    if (freeDevices.length > 0) {
        const randomDevice = freeDevices[Math.floor(Math.random() * freeDevices.length)];
        randomDevice.locked = true;
        randomDevice.lockStartTime = new Date().toISOString();
        randomDevice.lockDuration = null;
        randomDevice.lockedDuration = null;
        randomDevice.purpose = task.purpose; // 添加设备用途
        task.res.json({
            message: `Device ${randomDevice.ip} has been locked for purpose: ${randomDevice.purpose}.`,
            device: randomDevice
        });
        broadcastUpdate(); // 发送实时更新
    } else {
        waitingQueue.push(task.res);
    }
    callback();
}, 1);

function resolveWaitingRequests() {
    while (waitingQueue.length > 0) {
        const freeDevices = devicePool.filter(d => !d.locked);
        if (freeDevices.length > 0) {
            const randomDevice = freeDevices[Math.floor(Math.random() * freeDevices.length)];
            randomDevice.locked = true;
            randomDevice.lockStartTime = new Date().toISOString();
            randomDevice.lockDuration = null;
            randomDevice.lockedDuration = null;
            randomDevice.purpose = 'General Purpose'; // 为等待队列中的请求提供默认用途
            const waitingRes = waitingQueue.shift();
            waitingRes.json({
                message: `Device ${randomDevice.ip} has been locked for purpose: ${randomDevice.purpose}.`,
                device: randomDevice
            });
            broadcastUpdate(); // 发送实时更新
        } else {
            break;
        }
    }
}

// WebSocket 服务器
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', ws => {
    ws.send(JSON.stringify({ type: 'all-devices', devices: devicePool }));
});

function broadcastUpdate() {
    const message = JSON.stringify({ type: 'all-devices', devices: devicePool });
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
}

/**
 * @swagger
 * /devices/lock-free:
 *   post:
 *     summary: Get and lock a free random device with a specific purpose
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purpose:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully locked a random device for a specific purpose
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 device:
 *                   type: object
 *                   properties:
 *                     ip:
 *                       type: string
 *                     name:
 *                       type: string
 *                     locked:
 *                       type: boolean
 *                     lockStartTime:
 *                       type: string
 *                     lockDuration:
 *                       type: string
 *                     lockedDuration:
 *                       type: string
 *                     purpose:
 *                       type: string
 */
app.post('/devices/lock-free', (req, res) => {
    const { purpose } = req.body;
    if (!purpose) {
        return res.status(400).json({ error: 'Purpose is required to lock a device.' });
    }

    requestQueue.push({ res, purpose });
});

/**
 * @swagger
 * /devices/release/{ip}:
 *   post:
 *     summary: Release a device by IP address
 *     parameters:
 *       - name: ip
 *         in: path
 *         description: IP address of the device to be released
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device released successfully
 *       404:
 *         description: Device not found or not locked
 */
app.post('/devices/release/:ip', (req, res) => {
    const deviceIp = req.params.ip;
    const device = devicePool.find(d => d.ip === deviceIp);

    if (device && device.locked) {
        const lockEndTime = new Date();
        const lockStartTime = new Date(device.lockStartTime);
        const lockDuration = Math.floor((lockEndTime - lockStartTime) / 1000);
        device.lockDuration = `${lockDuration} seconds`;
        device.locked = false;
        device.lockedDuration = null;
        device.purpose = null; // 清除用途信息
        res.json({ message: `Device ${deviceIp} has been released after being locked for ${device.lockDuration}.` });
        resolveWaitingRequests();
        broadcastUpdate(); // 发送实时更新
    } else {
        res.status(404).json({ error: 'Device not found or not locked.' });
    }
});

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get the status of all devices
 *     responses:
 *       200:
 *         description: A list of devices and their status
 */
app.get('/devices', (req, res) => {
    const now = new Date();
    devicePool.forEach(device => {
        if (device.locked) {
            const lockStartTime = new Date(device.lockStartTime);
            const lockedDuration = Math.floor((now - lockStartTime) / 1000);
            device.lockedDuration = `${lockedDuration} seconds`;
        }
    });
    res.json(devicePool);
});

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Add a new device to the pool
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ip:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device added successfully
 */
app.post('/devices', (req, res) => {
    const { ip, name } = req.body;

    if (!ip || !name) {
        return res.status(400).json({ error: 'Device IP and name are required.' });
    }

    // 检查 IP 地址是否已经存在
    if (devicePool.some(d => d.ip === ip)) {
        return res.status(400).json({ error: 'Device IP already exists.' });
    }

    const newDevice = {
        ip,
        name,
        locked: false,
        lockStartTime: null,
        lockDuration: null,
        lockedDuration: null,
        purpose: null
    };
    devicePool.push(newDevice);
    res.status(201).json({ message: `Device ${ip} has been added and is available for locking.`, device: newDevice });
    broadcastUpdate(); // 发送实时更新
});

/**
 * @swagger
 * /devices/{ip}:
 *   delete:
 *     summary: Remove a device from the pool by IP address
 *     parameters:
 *       - name: ip
 *         in: path
 *         description: IP address of the device to be removed
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device removed successfully
 *       404:
 *         description: Device not found
 */
app.delete('/devices/:ip', (req, res) => {
    const deviceIp = req.params.ip;
    const deviceIndex = devicePool.findIndex(d => d.ip === deviceIp);

    if (deviceIndex === -1) {
        return res.status(404).json({ error: 'Device not found.' });
    }

    devicePool.splice(deviceIndex, 1);
    res.json({ message: `Device ${deviceIp} has been removed from the pool.` });
    broadcastUpdate(); // 发送实时更新
});

// 处理 WebSocket 连接
const server = app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
    });
});
