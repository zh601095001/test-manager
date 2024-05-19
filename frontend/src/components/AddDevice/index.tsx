"use client"
import React, {useState} from 'react';
import {useNotifications} from "@/components/NotificationProvider";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "@/features/loading/loadingSlice";

function AddDevice() {
    const [ip, setIp] = useState('');
    const [name, setName] = useState('');
    const {showNotification} = useNotifications();
    const dispatch = useDispatch()

    async function addDevice(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        dispatch(showLoading())


        try {
            const response = await fetch('/api/devices', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ip, name})
            });
            const result = await response.json();
            showNotification(result.message || result.error, !!result.error);
        } finally {
            dispatch(hideLoading())
        }
    }

    return (
        <div>
            <form className="form-container" onSubmit={addDevice}>
                <div className="item">
                    <label htmlFor="ip">新设备IP:</label>
                    <input
                        type="text"
                        id="ip"
                        name="ip"
                        required
                        value={ip}
                        onChange={e => setIp(e.target.value)}
                    />
                </div>
                <div className="item">
                    <label htmlFor="name">新设备名:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
                <input className="blue-button" type="submit" value="添加设备"/>
            </form>
        </div>
    );
}

export default AddDevice;
