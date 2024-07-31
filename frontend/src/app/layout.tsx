"use client"
import "./globals.css";
import React from "react";

import {store} from "@/store";
import {Provider} from "react-redux";
import {WebSocketProvider} from "@/components/WebsocketProvider";
import LoadingOverlay from "@/components/LoadingOverlay";


export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
        <body>
        <Provider store={store}>
            <LoadingOverlay/>
            <WebSocketProvider>
                {children}
            </WebSocketProvider>
        </Provider>
        </body>
        </html>
    );
}
