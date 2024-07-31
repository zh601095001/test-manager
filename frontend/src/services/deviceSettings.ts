import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from "@/lib/baseQuery";

// 定义设备设置和固件的类型
export interface DeviceSettings {
    firmwareList: Array<{
        fileName: string;
        objectName: string;
    }>;
    switchScript: string;
}

interface FirmwarePayload {
    fileName: string;
    objectName: string;
}

export const deviceSettingsApi = createApi({
    reducerPath: 'deviceSettingsApi',
    baseQuery: baseQueryWithReauth(true),
    tagTypes: ['DeviceSettings'],
    endpoints: (builder) => ({
        getDeviceSettings: builder.query<DeviceSettings, void>({
            query: () => 'device-settings',
            providesTags: ['DeviceSettings']
        }),
        addFirmware: builder.mutation<DeviceSettings, FirmwarePayload>({
            query: (firmware) => ({
                url: 'device-settings/firmware',
                method: 'POST',
                body: firmware,
            }),
            invalidatesTags: ['DeviceSettings']
        }),
        removeFirmware: builder.mutation<DeviceSettings, { objectName: string }>({
            query: ({ objectName }) => ({
                url: `device-settings/firmware/${objectName}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['DeviceSettings']
        }),
        updateDeviceSettings: builder.mutation<DeviceSettings, Partial<DeviceSettings>>({
            query: (settings) => ({
                url: 'device-settings',
                method: 'PUT',
                body: settings,
            }),
            invalidatesTags: ['DeviceSettings']
        }),
    }),
});

// 导出钩子
export const {
    useGetDeviceSettingsQuery,
    useAddFirmwareMutation,
    useRemoveFirmwareMutation,
    useUpdateDeviceSettingsMutation,
} = deviceSettingsApi;
