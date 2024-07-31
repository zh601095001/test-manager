import {createApi} from '@reduxjs/toolkit/query/react'
import {baseQueryWithReauth} from "@/lib/baseQuery";

// Define a service using a base URL and expected endpoints
export const devicePoolApi = createApi({
    reducerPath: 'devicePoolApi',
    baseQuery: baseQueryWithReauth(true),
    endpoints: (builder) => ({
        lockByDeviceIp: builder.mutation({
            query: ({deviceIp, user}: { deviceIp: string, user: string }) => ({
                url: `devices/lock/${deviceIp}`,
                method: 'POST',
                body: {user},
            }),
        }),
        releaseDeviceByIp: builder.mutation({
            query: ({deviceIp}: { deviceIp: string }) => ({
                url: `devices/release/${deviceIp}`,
                method: 'POST',
            }),
        }),
        removeDeviceByIp: builder.mutation({
            query: ({deviceIp}: { deviceIp: string }) => ({
                url: `devices/${deviceIp}`,
                method: 'DELETE',
            }),
        }),
        addDevice: builder.mutation({
            query: ({deviceName, deviceIp, deviceMac}: {
                deviceIp: string,
                deviceName: string,
                deviceMac: string
            }) => ({
                url: `devices`,
                method: 'POST',
                body: {
                    deviceName, deviceIp, deviceMac
                }
            }),
        }),
        updateDevice: builder.mutation({
            query: ({deviceIp, ...extras}: {
                deviceIp: string;       // Optional new IP address for the device
                deviceMac?: string;      // Optional new MAC address for the device
                deviceName?: string;     // Optional new name for the device
                deviceFirmware?: string; // Optional firmware version
                user?: string;           // Optional associated user
                comment?: string;        // Optional comment about the device
                status?: "locked" | "unlocked" | "maintained"; // Optional status of the device
                lockTime?: Date | string;  // Optional lock time, could be Date or string depending on how you handle dates
                duration?: string;      // Optional duration for how long the device has been locked
            }) => ({
                url: `devices/${deviceIp}`,
                method: 'PUT',
                body: extras
            }),
        }),
        setSshConfig: builder.mutation({
            query: ({deviceIp, ...extras}: {
                deviceIp: string;
                port?: number;
                username?: string;
                password?: string
            }) => ({
                url: `device/${deviceIp}/ssh-config`,
                method: "PUT",
                body: extras
            })
        }),
        getSshConfig: builder.mutation({
            query: ({deviceIp}: {
                deviceIp: string;
            }) => ({
                url: `device/${deviceIp}/ssh-config`,
                method: "GET",
            })
        }),
        setRefreshFirmware: builder.mutation({
            query: ({deviceIp, ...extras}: {
                deviceIp: string;
                flag?: boolean;
                refreshScript?: string;
            }) => ({
                url: `device/${deviceIp}/refresh-firmware`,
                method: "PUT",
                body: extras
            })
        }),
        addSwitchFirmwareListItem: builder.mutation({
            query: ({deviceIp, ...extras}: {
                deviceIp: string;
                fileName?: string;
                objectName?: string;
            }) => ({
                url: `device/${deviceIp}/switch-firmware`,
                method: "PUT",
                body: extras
            })
        }),
        rmSwitchFirmwareListItem: builder.mutation({
            query: ({deviceIp, ...extras}: {
                deviceIp: string;
                objectName?: string;
            }) => ({
                url: `device/${deviceIp}/switch-firmware`,
                method: "DELETE",
                body: extras
            })
        }),
        setCurrentSwitchFirmwareListItem: builder.mutation({
            query: ({deviceIp, ...extras}: {
                deviceIp: string;
                objectName?: string;
                installFlag?: boolean
            }) => ({
                url: `device/${deviceIp}/switch-firmware/current`,
                method: "PUT",
                body: extras
            })
        }),
        setSwitchScript: builder.mutation({
            query: ({deviceIp, ...extras}: {
                deviceIp: string;
                switchScript?: string;
            }) => ({
                url: `device/${deviceIp}/switch-firmware/script`,
                method: "PUT",
                body: extras
            })
        }),
    }),
})

export const {
    useLockByDeviceIpMutation,
    useReleaseDeviceByIpMutation,
    useRemoveDeviceByIpMutation,
    useAddDeviceMutation,
    useUpdateDeviceMutation,
    useSetSshConfigMutation,
    useSetRefreshFirmwareMutation,
    useAddSwitchFirmwareListItemMutation,
    useRmSwitchFirmwareListItemMutation,
    useSetCurrentSwitchFirmwareListItemMutation,
    useSetSwitchScriptMutation,
    useGetSshConfigMutation
} = devicePoolApi