import React from 'react';
import {Button, Form, Input, Modal, type ModalProps, Tabs} from "antd";

interface AddRunnerModalProps extends ModalProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function AddRunnerModel({setOpen, ...modalProps}: AddRunnerModalProps) {
    const handleSubmit = (value: any) => {
        console.log(value)
    }
    return (
        <Modal
            width={"60%"}
            title="添加Runner"
            onCancel={() => setOpen(false)}
            footer={""}
            destroyOnClose={true}
            {...modalProps}
        >
            <div style={{padding: 20}}>
                <Form onFinish={handleSubmit}>
                    <Form.Item
                        label="名称"
                        name="runnerName"
                        labelCol={{span: 4}}
                        wrapperCol={{span: 16}}
                        rules={[
                            {required: true, message: '请输入runner名称'},
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="IP地址"
                        name="runnerIp"
                        labelCol={{span: 4}}
                        wrapperCol={{span: 16}}
                        rules={[
                            {
                                required: true,
                                message: '请输入runner的IP地址',
                            },
                            {
                                pattern: /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/,
                                message: '请输入一个有效的IP地址',
                            },
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="端口号"
                        name="runnerPort"
                        labelCol={{span: 4}}
                        wrapperCol={{span: 16}}
                        rules={[
                            {required: true, message: '请输入端口号'},
                            {pattern: /^[0-9]+$/, message: '端口号必须是数字'},
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || (Number(value) > 0 && Number(value) <= 65535)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('请输入有效的端口号 (1-65535)'));
                                },
                            }),
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="SSH用户名"
                        name="username"
                        labelCol={{span: 4}}
                        wrapperCol={{span: 16}}
                        rules={[
                            {required: true, message: '请输入ssh用户名'},
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="SSH密码"
                        name="password"
                        labelCol={{span: 4}}
                        wrapperCol={{span: 16}}
                        rules={[
                            {required: true, message: '请输入ssh密码'},
                        ]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item
                        wrapperCol={{span: 18, offset: 10}}
                    >
                        <Button type="primary" htmlType="submit">添加</Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}

export default AddRunnerModel;