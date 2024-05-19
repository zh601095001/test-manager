// store.js
import {configureStore} from '@reduxjs/toolkit';
import devicePoolReducer from "@/features/devicePool/devicePoolSlice";
import websocketReducer from "@/features/websocket/websocketSlice"
import loadingReducer from '@/features/loading/loadingSlice';

export const store = configureStore({
    reducer: {
        devicePool: devicePoolReducer,
        websocket: websocketReducer,
        loading: loadingReducer,
    },
});
