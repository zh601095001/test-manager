"use client"
import React, {createContext, useContext, useEffect, useMemo} from 'react';
import WebSocketService from '@/lib/websocket';
import {useDispatch} from "react-redux";
import config from "@/config"
// 定义 WebSocketService 的类型或接口，此处直接使用实例类型
const WebSocketContext = createContext<WebSocketService | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const dispatch = useDispatch()
    // useMemo 来确保 wsService 只在客户端创建
    const wsService = useMemo(() => {
        if (config.ws_url) { // 确保仅在客户端执行
            return new WebSocketService(config.ws_url, dispatch);
        }
        return null; // 服务端返回 null
    }, []);

    useEffect(() => {
        wsService?.connect();

        return () => {
            wsService?.disconnect();
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
