import {Dispatch} from 'redux';
import {updateDevices, updateHarbors, updateRunningTaskCount} from "@/features/websocket/websocketSlice";

class WebSocketService {
    private socket: WebSocket | null;
    private dispatch: Dispatch;
    private url: string; // 保存 WebSocket 服务器的 URL
    private shouldReconnect: boolean; // 控制是否应该重连
    private reconnectInterval: number; // 重连的时间间隔，以毫秒为单位

    constructor(url: string, dispatch: Dispatch, reconnectInterval = 5000) {
        this.socket = null;
        this.dispatch = dispatch;
        this.shouldReconnect = true; // 默认为自动重连
        this.reconnectInterval = reconnectInterval;
        this.url = url;
    }

    connect(): void {
        if (this.socket !== null && this.socket.readyState !== WebSocket.CLOSED) {
            console.log('WebSocket is already connected or connecting.');
            return;
        }

        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
        };

        this.socket.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            if (message.type === 'all-devices') {
                this.dispatch(updateDevices(message.items));
            } else if (message.type === "all-harbors") {
                this.dispatch(updateHarbors(message.items))
            } else if (message.type === "all-running-tasks") {
                this.dispatch(updateRunningTaskCount(message.items))
            }
        };

        this.socket.onerror = (error: Event) => {
            console.log('WebSocket Error:', error);
            this.socket = null; // 确保在断开后将socket设置为null
            setTimeout(() => this.connect(), this.reconnectInterval);
        };

        this.socket.onclose = (event: CloseEvent) => {
            console.log('WebSocket Disconnected');
            this.socket = null; // 确保在断开后将socket设置为null
            if (this.shouldReconnect) {
                setTimeout(() => this.connect(), this.reconnectInterval);
            }
        };
    }

    sendMessage(message: object): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    disconnect(): void {
        this.shouldReconnect = false; // 断开连接时禁止自动重连
        if (this.socket) {
            this.socket.close();
        }
    }
}

export default WebSocketService;
