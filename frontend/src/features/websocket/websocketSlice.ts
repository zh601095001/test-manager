// features/websocketSlice.js
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Device {
    ip: string;
    name: string;
    locked: boolean;
    lockStartTime: string | null;
    lockedDuration: string | null;
    purpose: string | null;
}

interface WebSocketState {
    devices: Device[]
    hasFree: boolean
}

const initialState: WebSocketState = {
    devices: [],
    hasFree: true
};
export const websocketSlice = createSlice({
    name: 'websocket',
    initialState,
    reducers: {
        updateDevices: (state, action: PayloadAction<Device[]>) => {
            state.devices = action.payload;
            state.hasFree = action.payload.some(device => !device.locked);
        },
    },
});

export const {updateDevices} = websocketSlice.actions;
export const selectDevices = (state: any) => state.websocket.devices;
export const selectHasFreeDevice = (state: any) => state.websocket.hasFree;
export default websocketSlice.reducer;
