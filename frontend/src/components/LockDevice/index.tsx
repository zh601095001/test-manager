"use client"
import React, {useState} from 'react';
import {useNotifications} from "@/components/NotificationProvider";
import {useDispatch, useSelector} from "react-redux";
import {showLoading, hideLoading} from "@/features/loading/loadingSlice";
import {selectHasFreeDevice} from "@/features/websocket/websocketSlice";

function LockDevice() {
    const [purpose, setPurpose] = useState('');
    const {showNotification} = useNotifications();
    const dispatch = useDispatch()
    const hasFreeDevice = useSelector(selectHasFreeDevice)

    async function lockDevice(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        dispatch(showLoading()) // 显示加载蒙版
        try {
            const response = await fetch('/api/devices/lock-free', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({purpose})
            });
            const result = await response.json();
            showNotification(result.message || result.error, !!result.error);
        } finally {
            dispatch(hideLoading()) // 显示加载蒙版
        }
    }

    return (
        <>
            <form className="form-container" onSubmit={lockDevice}>
                <div className="item">
                    <label htmlFor="purpose">使用者:</label>
                    <input
                        type="text"
                        id="purpose"
                        name="purpose"
                        required
                        value={purpose}
                        onChange={e => setPurpose(e.target.value)}
                    />
                </div>
                <input
                    disabled={!hasFreeDevice}
                    className={hasFreeDevice ? "blue-button" : "gray-button"}
                    type="submit"
                    value="获取空闲设备" id="get-free-device-btn"
                />
            </form>
        </>
    );
}

export default LockDevice;
