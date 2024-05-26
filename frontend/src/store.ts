// store.js
import {configureStore} from '@reduxjs/toolkit';
import devicePoolReducer, {devicePoolSlice} from "@/features/demo/devicePoolSlice";
import websocketReducer from "@/features/websocket/websocketSlice"
import loadingReducer from '@/features/loading/loadingSlice';
import {devicePoolApi} from "@/services/devicePool";
import authReducer from '@/features/auth/authSlice'
import {authApi} from "@/services/auth"

export const store = configureStore({
    reducer: {
        devicePool: devicePoolReducer,
        websocket: websocketReducer,
        loading: loadingReducer,
        [devicePoolApi.reducerPath]: devicePoolApi.reducer,
        [authApi.reducerPath]: authApi.reducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(devicePoolApi.middleware,authApi.middleware),

});


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch