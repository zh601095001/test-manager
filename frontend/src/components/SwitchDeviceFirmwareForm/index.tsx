import React, {useEffect, useState} from 'react';
import {Button, Form, message, Select, Upload, UploadProps} from "antd";
import {InboxOutlined} from "@ant-design/icons";
import CodeEditorForm from "@/components/CodeInput";
import {
    useAddSwitchFirmwareListItemMutation,
    useRmSwitchFirmwareListItemMutation, useSetCurrentSwitchFirmwareListItemMutation,
    useSetSwitchScriptMutation
} from "@/services/devicePool";
import styles from "./index.module.scss"

const {Dragger} = Upload;
const layout = {
    labelCol: {span: 2},
    wrapperCol: {span: 22},
};

function SwitchDeviceFirmwareForm({record}: { record: any }) {
    const [form] = Form.useForm()
    const [addSwitchFirmwareListItem] = useAddSwitchFirmwareListItemMutation()
    const [rmSwitchFirmwareListItem] = useRmSwitchFirmwareListItemMutation()
    const [setSwitchScript] = useSetSwitchScriptMutation()
    const [setCurrentSwitchFirmwareListItem] = useSetCurrentSwitchFirmwareListItemMutation()
    const props: UploadProps = {
        name: 'file',
        multiple: true,
        action: '/api/files/firmwares',
        onChange: async (info) => {
            const {status} = info.file;
            if (status === "removed") {
                const {name: fileName, response: {objectName}} = info.file
                await rmSwitchFirmwareListItem({
                    deviceIp: record.deviceIp,
                    objectName
                })
            } else if (status === 'done') {
                const {name: fileName, response: {objectName}} = info.file
                await addSwitchFirmwareListItem({
                    deviceIp: record.deviceIp,
                    objectName,
                    fileName
                })
                await message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                await message.error(`${info.file.name} file upload failed.`);
            }
        },
    };
    let switchScript = ""
    let currentObjectName = ""
    let firmwareList = []
    if (record.switchFirmware) {
        const switchFirmware = record.switchFirmware
        if (switchFirmware.switchScript) {
            switchScript = switchFirmware.switchScript
        }
        if (switchFirmware.currentObjectName) {
            currentObjectName = switchFirmware.currentObjectName
        }
        if (switchFirmware.firmwareList) {
            firmwareList = switchFirmware.firmwareList.map((value: any) => ({
                value: value.objectName,
                label: value.fileName
            }))
        }
    }
    useEffect(() => {
        form.setFieldValue("updateScript", switchScript)
    }, [switchScript]);
    const handleValuesChange = async (changedValues: any, allValues: any) => {
        const {currentObjectName} = changedValues
        if (currentObjectName) {
            const response = await setCurrentSwitchFirmwareListItem({
                deviceIp: record.deviceIp,
                objectName: currentObjectName
            }).unwrap()
            message.success(response.message)
        }
    }
    const handleFirmwareListDelete = async (e: any, option: any) => {
        e.stopPropagation()
        const {value: objectName, label: fileName} = option
        await rmSwitchFirmwareListItem({
            deviceIp: record.deviceIp,
            objectName
        })
        await message.success(`${fileName}删除成功.`);
    }
    const handleUpdateScriptSave = async ({code}: { code: string }) => {
        await setSwitchScript({
            deviceIp: record.deviceIp,
            switchScript: code
        })
    }
    return (
        <div>
            <Form form={form} {...layout} onValuesChange={handleValuesChange}>
                <Form.Item label="切换固件" className={styles.switchDeviceFirmwareFormItemSwitchFirmwareSelect}>
                    <Form.Item name="currentObjectName" wrapperCol={{span: 24}}>
                        <Select
                            defaultValue={currentObjectName}
                            // style={{width: 200}}
                            options={firmwareList}
                            optionFilterProp="label"
                            showSearch={true}
                            optionRender={(option, info: { index: number }) => {
                                return (
                                    <div
                                        style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}
                                    >
                                        <span>{option.label}</span>
                                        <Button
                                            type="primary"
                                            danger
                                            size="middle"
                                            onClick={(e) => handleFirmwareListDelete(e, option)}
                                        >删除</Button>
                                    </div>
                                )
                            }}
                        />
                        <Button type="primary" style={{marginLeft: 10}}>重新安装</Button>
                    </Form.Item>
                </Form.Item>
                <Form.Item label="固件上传">
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">点击或拖拽文件到此处</p>
                        <p className="ant-upload-hint">
                            支持单个或多个文件
                        </p>
                    </Dragger>
                </Form.Item>
                <Form.Item name="updateScript" label="固件安装脚本">
                    <CodeEditorForm
                        defaultLanguage="shell"
                        disableLanguageSwitch={true}
                        onSave={handleUpdateScriptSave}
                    />
                </Form.Item>
            </Form>
        </div>
    );
}

export default SwitchDeviceFirmwareForm;