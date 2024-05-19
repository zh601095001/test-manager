"use client"
import "./globals.css";
import React from "react";

import {store} from "@/store";
import {Provider} from "react-redux";
import {NotificationProvider} from "@/components/NotificationProvider";
import {WebSocketProvider} from "@/components/WebsocketProvider";
import LoadingOverLay from "@/components/LoadingOverLay";


export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {

    return (
        <html lang="en">
        <Provider store={store}>
            <body>
            <WebSocketProvider>
                <NotificationProvider>
                    <LoadingOverLay>
                        {children}
                    </LoadingOverLay>
                </NotificationProvider>
            </WebSocketProvider>
            </body>
        </Provider>
        </html>
    );
}
