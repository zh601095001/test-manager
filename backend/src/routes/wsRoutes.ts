import { WebSocketServer } from 'ws';
import * as deviceService from '../services/deviceService';
import { Server } from 'http';

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', ws => {
    deviceService.getAllDevices().then(devices => {
        ws.send(JSON.stringify({ type: 'all-devices', devices }));
    });
});

function broadcastUpdate() {
    deviceService.getAllDevices().then(devices => {
        const message = JSON.stringify({ type: 'all-devices', devices });
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(message);
            }
        });
    });
}

// 每隔 1 秒广播一次最新状态
setInterval(broadcastUpdate, 1000);

function handleUpgrade(server: Server) {
    server.on('upgrade', (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, ws => {
            wss.emit('connection', ws, req);
        });
    });
}

export { handleUpgrade };
