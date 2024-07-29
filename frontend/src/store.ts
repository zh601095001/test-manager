// store.js
import {configureStore} from '@reduxjs/toolkit';
import devicePoolReducer, {devicePoolSlice} from "@/features/demo/devicePoolSlice";
import websocketReducer from "@/features/websocket/websocketSlice"
import loadingReducer from '@/features/loading/loadingSlice';
import {devicePoolApi} from "@/services/devicePool";
import authReducer from '@/features/auth/authSlice'
import {authApi} from "@/services/auth"
import {deviceSettingsApi} from "@/services/deviceSettings";
import {taskApi} from "@/services/task";
import {filesApi} from "@/services/files";
import {profileApi} from "@/services/profile";

export const store = configureStore({
    reducer: {
        devicePool: devicePoolReducer,
        websocket: websocketReducer,
        loading: loadingReducer,
        [devicePoolApi.reducerPath]: devicePoolApi.reducer,
        [authApi.reducerPath]: authApi.reducer,
        [deviceSettingsApi.reducerPath]: deviceSettingsApi.reducer,
        [taskApi.reducerPath]: taskApi.reducer,
        [filesApi.reducerPath]: filesApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(devicePoolApi.middleware, authApi.middleware, taskApi.middleware, deviceSettingsApi.middleware, filesApi.middleware, profileApi.middleware),

});


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch