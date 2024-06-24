import React from 'react';
import {Button, Form, Input, Space} from "antd";

const layout = {
    labelCol: {span: 2},
    wrapperCol: {span: 22},
};

function DeviceLoginForm({record}: { record: any }) {
    const initialValues = {
        deviceIp: record.deviceIp,
        devicePort: record.devicePort,
        username: record.username,
        password: record.password
    };
    return (
        <div>
            <Form {...layout} initialValues={initialValues}>
                <Form.Item label="IP" name="deviceIp">
                    <Input disabled/>
                </Form.Item>
                <Form.Item label="Port" name="devicePort">
                    <Input/>
                </Form.Item>
                <Form.Item label="用户名">
                    <Input/>
                </Form.Item>
                <Form.Item label="密码">
                    <Input.Password/>
                </Form.Item>
                <Form.Item wrapperCol={{span: 20, offset: 10}}>
                    <Button type="primary" htmlType="submit">保存配置</Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default DeviceLoginForm;