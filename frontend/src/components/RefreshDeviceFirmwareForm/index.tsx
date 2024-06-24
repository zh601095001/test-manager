import React from 'react';
import {Form, Input, Space, Switch} from "antd";
import CodeEditorForm from "@/components/CodeInput";
const layout = {
    labelCol: {span: 2},
    wrapperCol: {span: 22},
};
function UpdateDeviceFirmwareForm() {
    const [form] = Form.useForm()
    const handleChange = async (changedValues: any) => {
        console.log(changedValues);
    }
    return (
        <Form form={form} onValuesChange={handleChange} {...layout}>
            <Form.Item name="updateFirmwareFlag" label="自动刷新">
                <Switch/>
            </Form.Item>
            <Form.Item name="updateScript" label="刷新脚本">
                <CodeEditorForm defaultLanguage="shell" disableLanguageSwitch={true}/>
            </Form.Item>
        </Form>
    );
}

export default UpdateDeviceFirmwareForm;