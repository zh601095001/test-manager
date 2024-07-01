import {WebSocketServer, WebSocket as NodeWebSocket} from 'ws';
import deviceService from '../services/deviceService';
import {Server} from 'http';
import harborService from "../services/harborService";
import concurrentTaskService from "../services/concurrentTaskService";

const wss = new WebSocketServer({noServer: true});
const userMap = new Map<NodeWebSocket, { username: string | null }>();

wss.on('connection', (ws, req) => {
    deviceService.getAllDevices().then(devices => {
        ws.send(JSON.stringify({type: 'all-devices', items: devices}));
    });
    harborService.getAllHarbors().then(harbors => {
        ws.send(JSON.stringify({type: 'all-harbors', items: harbors}));
    });
    ws.on('close', () => {
        // userMap.delete(ws);
    });
});

/**
 * 广播或发送特定消息。
 * @param type 消息类型
 * @param dataProvider 数据来源，可以是函数或直接的数据
 * @param wsServer WebSocket服务器实例，默认为 wss
 * @param targetUsername 可选，目标用户名
 */
async function broadcast(type: string, dataProvider: (() => Promise<any>) | any, wsServer: WebSocketServer = wss, targetUsername?: string) {
    let items;
    if (typeof dataProvider === 'function') {
        items = await dataProvider();
    } else {
        items = dataProvider;
    }

    const message = JSON.stringify({type, items});

    wsServer.clients.forEach(client => {
        // 如果指定了 targetUsername，只向该用户发送消息
        const userInfo = userMap.get(client);
        if (client.readyState === NodeWebSocket.OPEN && (!targetUsername || (userInfo && userInfo.username === targetUsername))) {
            client.send(message);
        }
    });
}


// 每隔 1 秒广播一次最新状态
setInterval(() => {
    broadcast('all-devices', deviceService.getAllDevices);
    broadcast('all-harbors', harborService.getAllHarbors);
    broadcast("all-running-tasks", () => concurrentTaskService.getTasks({
        title: "(switchFirmware|批量更新)",
        limit: 1000,
        status: "running",
        onlyCount: true
    }))
}, 1000);

function handleUpgrade(server: Server) {
    server.on('upgrade', (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, ws => {
            wss.emit('connection', ws, req);
        });
    });
}

export {handleUpgrade, broadcast};
