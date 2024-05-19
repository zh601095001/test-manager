import {Dispatch} from 'redux';
import {updateDevices} from "@/features/websocket/websocketSlice";

class WebSocketService {
    private socket: WebSocket | null;
    private dispatch: Dispatch;

    constructor(dispatch: Dispatch) {
        this.socket = null;
        this.dispatch = dispatch;
    }

    connect(url: string): void {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
        };

        this.socket.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            if (message.type === 'all-devices') {
                this.dispatch(updateDevices(message.devices))
            }
        };

        this.socket.onerror = (error: Event) => {
            console.log('WebSocket Error:', error);
        };

        this.socket.onclose = () => {
            console.log('WebSocket Disconnected');
            // 可以在这里重新连接
        };
    }

    sendMessage(message: object): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
        }
    }
}

export default WebSocketService;
