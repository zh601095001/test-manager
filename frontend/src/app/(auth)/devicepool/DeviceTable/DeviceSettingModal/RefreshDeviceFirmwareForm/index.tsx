import React, {useEffect} from 'react';
import {Form, Input, Space, Switch} from "antd";
import CodeEditorForm from "@/components/CodeInput";
import {useSetRefreshFirmwareMutation} from "@/services/devicePool";

const layout = {
    labelCol: {span: 2},
    wrapperCol: {span: 22},
};

function UpdateDeviceFirmwareForm({record}: { record: any }) {
    const [setRefreshFirmware] = useSetRefreshFirmwareMutation()
    const [form] = Form.useForm()
    let refreshScript = ""
    let flag = false
    if (record.refreshFirmware) {
        const refreshFirmware = record.refreshFirmware
        if (refreshFirmware.refreshScript) {
            refreshScript = refreshFirmware.refreshScript
        }
        if (refreshFirmware.flag) {
            flag = refreshFirmware.flag
        }
    }
    useEffect(() => {
        form.setFieldValue("refreshScript", refreshScript)
        form.setFieldValue("flag", flag)
    }, [refreshScript]);
    const handleChange = async (changedValues: any) => {
        console.log(changedValues)
        const {flag} = changedValues
        if (flag !== undefined) {
            await setRefreshFirmware({
                deviceIp: record.deviceIp,
                flag
            })
        }
    }
    const handleSave = async ({code}: { code: string }) => {
        return setRefreshFirmware({
            deviceIp: record.deviceIp,
            refreshScript: code
        })
    }
    return (
        <Form form={form} onValuesChange={handleChange} {...layout}>
            <Form.Item name="flag" label="自动刷新">
                <Switch/>
            </Form.Item>
            <Form.Item name="refreshScript" label="刷新脚本">
                <CodeEditorForm defaultLanguage="shell" disableLanguageSwitch={true} onSave={handleSave}/>
            </Form.Item>
        </Form>
    );
}

export default UpdateDeviceFirmwareForm;