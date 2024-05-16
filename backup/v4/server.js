const express = require('express');
const async = require('async');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
        randomDevice.purpose = task.purpose;
        task.res.json({
            message: `设备 ${randomDevice.ip} 因 ${randomDevice.purpose} 被锁定.`,
            device: randomDevice
        });
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
            randomDevice.purpose = 'General Purpose';
            const waitingRes = waitingQueue.shift();
            waitingRes.json({
                message: `设备 ${randomDevice.ip} 因 ${randomDevice.purpose} 被锁定.`,
                device: randomDevice
            });
        } else {
            break;
        }
    }
}

// WebSocket 服务器
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', ws => {
    ws.send(JSON.stringify({ type: 'all-devices', devices: updateLockedDurations(devicePool) }));
});

function updateLockedDurations(devices) {
    const now = new Date();
    devices.forEach(device => {
        if (device.locked && device.lockStartTime) {
            const lockStartTime = new Date(device.lockStartTime);
            const lockedDuration = Math.floor((now - lockStartTime) / 1000);
            device.lockedDuration = formatDuration(lockedDuration);
        }
    });
    return devices;
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function broadcastUpdate() {
    const message = JSON.stringify({ type: 'all-devices', devices: updateLockedDurations(devicePool) });
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
}

// 每隔 1 秒广播一次最新状态
setInterval(broadcastUpdate, 1000);

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
 */
app.post('/devices/lock-free', (req, res) => {
    let { purpose } = req.body;
    if (!purpose) {
        purpose = "";
    }

    requestQueue.push({ res, purpose });
});

/**
 * @swagger
 * /devices/lock/{ip}:
 *   post:
 *     summary: Lock a specific device by IP address with a purpose
 *     parameters:
 *       - name: ip
 *         in: path
 *         description: IP address of the device to be locked
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Successfully locked the device with a specific purpose
 *       404:
 *         description: Device not found or already locked
 */
app.post('/devices/lock/:ip', (req, res) => {
    const deviceIp = req.params.ip;
    const { purpose } = req.body;

    const device = devicePool.find(d => d.ip === deviceIp);

    if (!device) {
        return res.status(404).json({ error: '未找到设备.' });
    }

    if (device.locked) {
        return res.status(400).json({ error: '设备已经被锁定.' });
    }

    // 锁定设备
    device.locked = true;
    device.lockStartTime = new Date().toISOString();
    device.lockDuration = null;
    device.purpose = purpose;

    res.json({ message: `设备 ${deviceIp} 因 ${purpose} 被锁定.`, device });
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
        device.lockDuration = formatDuration(lockDuration);
        device.locked = false;
        device.lockedDuration = null;
        device.purpose = null;
        res.json({ message: `设备 ${deviceIp} 释放成功，设备锁定用时：${device.lockDuration}.` });
        resolveWaitingRequests();
    } else {
        res.status(404).json({ error: '设备未找到或者未被锁定.' });
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
    res.json(updateLockedDurations(devicePool));
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
 */
app.post('/devices', (req, res) => {
    const { ip, name } = req.body;

    if (!ip || !name) {
        return res.status(400).json({ error: '设备 IP 和名称是必须的！' });
    }

    // 检查 IP 地址是否已经存在
    if (devicePool.some(d => d.ip === ip)) {
        return res.status(400).json({ error: '设备 IP 已存在！' });
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
    res.status(201).json({ message: `设备 ${ip} 添加成功.`, device: newDevice });
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

    if (deviceIndex >= 0) {
        devicePool.splice(deviceIndex, 1);
        res.json({ message: `设备 ${deviceIp} 已经被移除.` });
    } else {
        res.status(404).json({ error: '未找到设备.' });
    }
});

// 创建 WebSocket 服务器
const server = app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, ws => {
        wss.emit('connection', ws, req);
    });
});
