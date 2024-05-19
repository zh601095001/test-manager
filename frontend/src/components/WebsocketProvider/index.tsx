import React, { createContext, useContext, useEffect, useMemo } from 'react';
import WebSocketService from '@/lib/websocket';
import {useDispatch} from "react-redux";

// 定义 WebSocketService 的类型或接口，此处直接使用实例类型
const WebSocketContext = createContext<WebSocketService | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch()
    const wsService = useMemo(() => new WebSocketService(dispatch), []);

    useEffect(() => {
        wsService.connect('ws://localhost:8080');

        return () => {
            wsService.disconnect();
        };
    }, [wsService]);

    return (
        <WebSocketContext.Provider value={wsService}>
            {children}
        </WebSocketContext.Provider>
    );
};

// 自定义 hook 用于组件内访问 WebSocketService
export const useWebSocket = (): WebSocketService | null => useContext(WebSocketContext);
