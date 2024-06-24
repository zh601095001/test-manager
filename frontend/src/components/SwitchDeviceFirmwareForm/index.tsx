import React, {useEffect, useState} from 'react';
import {Form, message, Select, Upload, UploadProps} from "antd";
import {InboxOutlined} from "@ant-design/icons";
import CodeEditorForm from "@/components/CodeInput";

const {Dragger} = Upload;
const layout = {
    labelCol: {span: 2},
    wrapperCol: {span: 22},
};

function SwitchDeviceFirmwareForm({record}: { record: any }) {
    const [form] = Form.useForm()
    const props: UploadProps = {
        name: 'file',
        multiple: true,
        action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        onChange(info) {
            const {status} = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };
    let switchScript = ""
    let currentFirmware = ""
    let firmwareList = []
    if (record.switchFirmware) {
        const switchFirmware = record.switchFirmware
        if (switchFirmware.switchScript){
            switchScript = switchFirmware.switchScript
        }
        if (switchFirmware.currentFirmware){
            currentFirmware = switchFirmware.currentFirmware
        }
        if (switchFirmware.firmwareList) {
            firmwareList = switchFirmware.firmwareList.map((value: any) => ({
                value,
                label: value
            }))
        }
    }
    useEffect(() => {
        form.setFieldValue("updateScript",switchScript)
    }, [switchScript]);
    return (
        <div>
            <Form form={form} {...layout}>
                <Form.Item label="切换固件">
                    <Select
                        defaultValue={currentFirmware}
                        // style={{width: 200}}
                        options={firmwareList}
                    />
                </Form.Item>
                <Form.Item label="固件上传">
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Support for a single or bulk upload. Strictly prohibited from uploading company data or
                            other
                            banned files.
                        </p>
                    </Dragger>
                </Form.Item>
                <Form.Item name="updateScript" label="固件安装脚本">
                    <CodeEditorForm defaultLanguage="shell" disableLanguageSwitch={true}/>
                </Form.Item>
            </Form>
        </div>
    );
}

export default SwitchDeviceFirmwareForm;