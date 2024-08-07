// features/websocketSlice.js
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Device {
    deviceName: string;
    deviceIp: string;
    deviceMac: string;
    deviceFirmware: string | null;
    lockTime: string | null;
    duration: string | null;
    user: string;
    comment: string;
    status: "locked" | "unlocked" | "maintained";
}

interface WebSocketState {
    devices: Device[]
    hasFree: boolean
    runningTaskCount: number;
    harbors: any[]
}

const initialState: WebSocketState = {
    devices: [],
    harbors: [],
    runningTaskCount: 0,
    hasFree: true
};
export const websocketSlice = createSlice({
    name: 'websocket',
    initialState,
    reducers: {
        updateDevices: (state, action: PayloadAction<Device[]>) => {
            state.devices = action.payload;
            state.hasFree = action.payload.some(device => device.status === "unlocked");
        },
        updateHarbors: (state, action: PayloadAction<Device[]>) => {
            state.harbors = action.payload;
        },
        updateRunningTaskCount: (state, action: PayloadAction<{ count: number }>) => {
            state.runningTaskCount = action.payload.count;
        }
    },
});

export const {updateDevices, updateHarbors, updateRunningTaskCount} = websocketSlice.actions;
export const selectDevices = (state: any) => state.websocket.devices;
export const selectHarbors = (state: any) => state.websocket.harbors;
export const selectRunningTasks = (state: any) => state.websocket.runningTaskCount;
export const selectHasFreeDevice = (state: any) => state.websocket.hasFree;
export default websocketSlice.reducer;
