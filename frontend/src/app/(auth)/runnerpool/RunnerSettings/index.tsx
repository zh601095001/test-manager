"use client"
import React, {useState} from 'react';
import {Form, Select} from "antd";

function RunnerSettings() {
    const [options, setOptions] = useState()
    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
    return (
        <Form>
            <Form.Item
                name="testFolders"
                label="测试文件夹"
                labelCol={{span: 4}}
                wrapperCol={{span: 16}}
                rules={[{required: true, message: '请输入设备名'}]}
            >
                <Select
                    mode="tags"
                    style={{width: '100%'}}
                    placeholder="Tags Mode"
                    onChange={handleChange}
                    options={options}
                />
            </Form.Item>
            <Form.Item
                name="configPath"
                label="当前配置文件"
                labelCol={{span: 4}}
                wrapperCol={{span: 16}}
                rules={[{required: true, message: '请输入设备名'}]}
            >
                <Select
                    style={{width: '100%'}}
                    placeholder="Tags Mode"
                    onChange={handleChange}
                    options={options}
                />
            </Form.Item>
            <Form.Item
                name="xin3appVersion"
                label="上位机版本"
                labelCol={{span: 4}}
                wrapperCol={{span: 16}}
                rules={[{required: true, message: '请输入设备名'}]}
            >
                <Select
                    mode="tags"
                    style={{width: '100%'}}
                    placeholder="Tags Mode"
                    onChange={handleChange}
                    options={options}
                />
            </Form.Item>
            <Form.Item
                name="concurrentOnEachNode"
                label="单节点并行数"
                labelCol={{span: 4}}
                wrapperCol={{span: 16}}
                rules={[{required: true, message: '请输入设备名'}]}
            >
                <Select
                    style={{width: '100%'}}
                    placeholder="Tags Mode"
                    onChange={handleChange}
                    options={options}
                />
            </Form.Item>
            <Form.Item
                name="nodeGroup"
                label="节点组"
                labelCol={{span: 4}}
                wrapperCol={{span: 16}}
                rules={[{required: true, message: '请输入设备名'}]}
            >
                <Select
                    style={{width: '100%'}}
                    placeholder="Tags Mode"
                    onChange={handleChange}
                    options={options}
                />
            </Form.Item>
            <Form.Item
                name="allowedEmailRecipients"
                label="允许接收邮件的用户"
                labelCol={{span: 4}}
                wrapperCol={{span: 16}}
                rules={[{required: true, message: '请输入设备名'}]}
            >
                <Select
                    style={{width: '100%'}}
                    placeholder="Tags Mode"
                    onChange={handleChange}
                    options={options}
                />
            </Form.Item>
        </Form>
    );
}

export default RunnerSettings;