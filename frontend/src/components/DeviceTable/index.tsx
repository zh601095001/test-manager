"use client"
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {selectDevices} from "@/features/websocket/websocketSlice";
import {useNotifications} from "@/components/NotificationProvider";
import {showLoading, hideLoading} from "@/features/loading/loadingSlice";

// 定义设备对象的接口
interface Device {
    ip: string;
    name: string;
    locked: boolean;
    lockStartTime: string | null;
    lockedDuration: string | null;
    purpose: string | null;
}

const DeviceTable: React.FC = () => {
    // 使用选择器的类型，假设它返回Device数组
    const allDevices: Device[] = useSelector(selectDevices);
    const {showNotification} = useNotifications();
    const dispatch = useDispatch()


    async function lockSpecificDevice(ip: string): Promise<void> {
        const purpose: string | null = prompt('请输入锁定设备的使用者:');
        if (!purpose) return;

        dispatch(showLoading())
        try {
            const response = await fetch(`/api/devices/lock/${ip}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({purpose})
            });
            const result = await response.json();
            showNotification(result.message || result.error, !!result.error);
        } finally {
            dispatch(hideLoading())
        }
    }

    async function releaseDevice(ip: string): Promise<void> {
        const isConfirmed = confirm(`你确定要释放设备 ${ip} 吗？`);
        if (!isConfirmed) return;

        dispatch(showLoading())
        try {
            const response = await fetch(`/api/devices/release/${ip}`, {method: 'POST'});
            const result = await response.json();
            showNotification(result.message || result.error, !!result.error);
        } finally {
            dispatch(hideLoading())
        }
    }

    async function removeDevice(ip: string): Promise<void> {
        const isConfirmed = confirm(`你确定要移除设备 ${ip} 吗？`);
        if (!isConfirmed) return;

        dispatch(showLoading())
        try {
            const response = await fetch(`/api/devices/${ip}`, {method: 'DELETE'});
            const result = await response.json();
            showNotification(result.message || result.error, !!result.error);
        } finally {
            dispatch(hideLoading())
        }
    }

    function determineRowStyle(device: Device): React.CSSProperties {
        if (device.purpose?.includes("维护")) {
            return {backgroundColor: '#fffa8e'};
        }
        if (device.purpose?.includes("自动化测试")) {
            return {backgroundColor: '#e0e8f6'};
        }
        return device.locked ? {backgroundColor: '#f8d7da'} : {};
    }

    return (
        <table id="device-table">
            <thead>
            <tr>
                <th>设备名称</th>
                <th>设备IP地址</th>
                <th>锁定起始时间</th>
                <th>耗时</th>
                <th>使用者(用途)</th>
                <th>操作</th>
            </tr>
            </thead>
            <tbody>
            {allDevices.map((device: Device) => (
                <tr key={device.ip} style={determineRowStyle(device)}>
                    <td>{device.name}</td>
                    <td>{device.ip}</td>
                    <td>{device.lockStartTime || ''}</td>
                    <td>{device.lockedDuration || ''}</td>
                    <td>{device.purpose || ''}</td>
                    <td>
                        {device.locked ? (
                            <button className="blue-button" onClick={() => releaseDevice(device.ip)}>释放</button>
                        ) : (
                            <button className="green-button" onClick={() => lockSpecificDevice(device.ip)}>锁定</button>
                        )}
                        <button className="delete-button" onClick={() => removeDevice(device.ip)}>移除</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

export default DeviceTable;
