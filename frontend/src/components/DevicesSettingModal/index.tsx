import React from 'react';
import {Button, Form, message, ModalProps, Select, Upload, UploadProps} from 'antd';
import {Modal} from "antd";
import {InboxOutlined} from "@ant-design/icons";
import CodeEditorForm from "@/components/CodeInput";

const {Dragger} = Upload;
const layout = {
    labelCol: {span: 2},
    wrapperCol: {span: 22},
};

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
    devices: Device[] | null;  // 可选的自定义颜色属性
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function DevicesSettingModal({devices, setOpen, ...modalProps}: DeviceSettingModalProps) {
    const [form] = Form.useForm()
    let currentObjectName = ""
    let firmwareList: any = []
    const props: UploadProps = {
        name: 'file',
        multiple: true,
        action: '/api/files/firmwares',
        onChange: async (info) => {
            const {status} = info.file;
            if (status === "removed") {
                const {name: fileName, response: {objectName}} = info.file
                // await rmSwitchFirmwareListItem({
                //     deviceIp: record.deviceIp,
                //     objectName
                // })
            } else if (status === 'done') {
                const {name: fileName, response: {objectName}} = info.file
                // await addSwitchFirmwareListItem({
                //     deviceIp: record.deviceIp,
                //     objectName,
                //     fileName
                // })
                await message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                await message.error(`${info.file.name} file upload failed.`);
            }
        },
    };
    const handleValuesChange = () => {

    }
    const handleFirmwareListDelete = (e: any, option: any) => {

    }
    const handleUpdateScriptSave = ({code}: { code: any }) => {
        return new Promise(() => {

        })
    }
    return (
        <Modal
            width={"60%"}
            title="设备固件批量切换"
            onCancel={() => setOpen(false)}
            footer={""}
            destroyOnClose={false}
            {...modalProps}
        >
            <div style={{padding: 20}}>
                <Form form={form} {...layout} onValuesChange={handleValuesChange}>
                    <Form.Item label="设备" name="currentObjectName">
                        <Select
                            defaultValue={currentObjectName}
                            options={firmwareList}
                            optionFilterProp="label"
                            showSearch={true}
                        />
                    </Form.Item>
                    <Form.Item label="固件" name="currentObjectName">
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
                    <Form.Item wrapperCol={{span: 20, offset: 12}}>
                        <Button type="primary" htmlType="submit">一键安装</Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}

export default DevicesSettingModal;
