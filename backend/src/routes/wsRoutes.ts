import {WebSocketServer} from 'ws';
import deviceService from '../services/deviceService';
import {Server} from 'http';
import harborService from "../services/harborService";

const wss = new WebSocketServer({noServer: true});

wss.on('connection', ws => {
    deviceService.getAllDevices().then(devices => {
        ws.send(JSON.stringify({type: 'all-devices', items: devices}));
    });
    harborService.getAllHarbors().then(harbors => {
        ws.send(JSON.stringify({type: 'all-harbors', items: harbors}));
    });
});

function broadcastUpdate() {
    // 抽象出广播消息的逻辑
    const broadcast = async (type: string, fetchFunction: () => any) => {
        const items = await fetchFunction();
        const message = JSON.stringify({type, items});
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(message);
            }
        });
    };

    // 分别对 devices 和 harbors 进行广播
    broadcast('all-devices', deviceService.getAllDevices);
    broadcast('all-harbors', harborService.getAllHarbors);
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

export {handleUpgrade};
