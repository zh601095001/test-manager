import React, {useState} from 'react';
import {Form, Input, Modal} from "antd";
import {useAddDeviceMutation} from "@/services/devicePool";

function AddDeviceModal({isModalOpen, setIsModalOpen}: {
    isModalOpen: boolean,
    setIsModalOpen: (isModalOpen: boolean) => void
}) {
    const [addDevice] = useAddDeviceMutation()
    const [form] = Form.useForm()
    const handleOk = () => {
        form.validateFields().then(({deviceName, deviceIp, deviceMac}) => {
            addDevice({deviceName, deviceIp, deviceMac})
            setIsModalOpen(false)
        })
    }
    return (
        <Modal
            title="添加设备"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={() => setIsModalOpen(false)}
            okText="添加"
            cancelText="取消"
        >
            <Form form={form}>
                <Form.Item
                    name="deviceName"
                    label="设备名"
                    labelCol={{span: 8}}
                    wrapperCol={{span: 16}}
                    rules={[{required: true, message: '请输入设备名'}]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="deviceIp"
                    label="设备ip"
                    labelCol={{span: 8}}
                    wrapperCol={{span: 16}}
                    rules={[{required: true, message: '请输入设备ip'}]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="deviceMac"
                    label="设备mac地址"
                    labelCol={{span: 8}}
                    wrapperCol={{span: 16}}
                    rules={[{required: true, message: '请输入设备mac地址'}]}
                >
                    <Input/>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddDeviceModal;