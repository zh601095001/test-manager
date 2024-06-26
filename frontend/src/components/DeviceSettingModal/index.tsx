import React from 'react';
import {Button, Form, Modal, Switch, Tabs, TabsProps} from "antd";
import type {ModalProps} from 'antd';
import UpdateDeviceFirmwareForm from "../RefreshDeviceFirmwareForm";
import SwitchDeviceFirmwareForm from "@/components/SwitchDeviceFirmwareForm";
import DeviceLoginForm from "../DeviceSSHForm";

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
    updateFirmwareFlag: boolean;
}

// 定义一个新的接口，扩展自 ModalProps，并添加自定义属性
interface DeviceSettingModalProps extends ModalProps {
    record: Device | null;  // 可选的自定义颜色属性
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function DeviceSettingModal({record, setOpen, ...modalProps}: DeviceSettingModalProps) {
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: '固件版本更新及切换',
            children: <SwitchDeviceFirmwareForm record={record}/>,
        },
        {
            key: '2',
            label: '固件版本刷新',
            children: <UpdateDeviceFirmwareForm record={record}/>,
        },
        {
            key: '3',
            label: 'SSH配置',
            children: <DeviceLoginForm record={record}/>,
        },
    ];
    return (
        <Modal
            width={"60%"}
            title={`设备设置(${record?.deviceName}-${record?.deviceIp})`}
            onCancel={() => setOpen(false)}
            footer={""}
            destroyOnClose={true}
            {...modalProps}
        >
            <div style={{padding: 20}}>
                <Tabs defaultActiveKey="1" items={items}/>
            </div>
        </Modal>
    );
}

export default DeviceSettingModal;
