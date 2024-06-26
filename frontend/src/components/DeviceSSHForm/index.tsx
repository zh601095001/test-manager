import React from 'react';
import {Button, Form, Input, message, Space} from "antd";
import {useSetSshConfigMutation} from "@/services/devicePool";

const layout = {
    labelCol: {span: 2},
    wrapperCol: {span: 22},
};

function DeviceLoginForm({record}: { record: any }) {
    const [setSshConfig] = useSetSshConfigMutation()
    const initialValues = {
        deviceIp: record.deviceIp,
        port: "",
        username: "",
        password: ""
    }
    if (record.sshConfig) {
        const sshConfig = record.sshConfig
        const {port, username, password} = sshConfig
        port && (initialValues.port = port)
        username && (initialValues.username = username)
        password && (initialValues.password = password)
    }
    const handleSave = async (values: any) => {
        console.log(values)
        const {deviceIp, port, username, password} = values
        const response = await setSshConfig({
            deviceIp,
            port,
            username,
            password
        }).unwrap()
        await message.success(response.message)
    }
    return (
        <div>
            <Form {...layout} initialValues={initialValues} onFinish={handleSave}>
                <Form.Item label="IP" name="deviceIp">
                    <Input disabled/>
                </Form.Item>
                <Form.Item label="Port" name="port">
                    <Input/>
                </Form.Item>
                <Form.Item label="用户名" name="username">
                    <Input autoComplete="off"/>
                </Form.Item>
                <Form.Item label="密码" name="password">
                    <Input.Password autoComplete="off"/>
                </Form.Item>
                <Form.Item wrapperCol={{span: 20, offset: 11}}>
                    <Button type="primary" htmlType="submit">保存配置</Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default DeviceLoginForm;