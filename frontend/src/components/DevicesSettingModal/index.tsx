import React, {useEffect} from 'react';
import {Button, Form, message, ModalProps, Select, Upload, UploadProps} from 'antd';
import {Modal} from "antd";
import {InboxOutlined} from "@ant-design/icons";
import CodeEditorForm from "@/components/CodeInput";
import styles from "./index.module.scss"
import {
    useAddFirmwareMutation,
    useGetDeviceSettingsQuery,
    useRemoveFirmwareMutation, useUpdateDeviceSettingsMutation
} from "@/services/deviceSettings";
import {useCreateConcurrentTaskMutation} from "@/services/task";
import {useGetFileUrlMutation} from "@/services/files";
import {
    useAddSwitchFirmwareListItemMutation,
    useGetSshConfigMutation,
    useSetCurrentSwitchFirmwareListItemMutation
} from "@/services/devicePool";

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
    const {data: deviceSettings} = useGetDeviceSettingsQuery()
    const [addFirmware] = useAddFirmwareMutation()
    const [removeFirmware] = useRemoveFirmwareMutation()
    const [updateDeviceSettings] = useUpdateDeviceSettingsMutation()
    const [createConcurrentTask] = useCreateConcurrentTaskMutation()
    const [getFileUrl] = useGetFileUrlMutation()
    const [getSshConfig] = useGetSshConfigMutation()
    const [addSwitchFirmwareListItem] = useAddSwitchFirmwareListItemMutation()
    const [setCurrentSwitchFirmwareListItem] = useSetCurrentSwitchFirmwareListItemMutation()
    const deviceNames = new Set<string>()
    devices?.forEach(device => {
        deviceNames.add(device.deviceName)
    })
    useEffect(() => {
        const switchScript = deviceSettings?.switchScript
        if (switchScript) {
            form.setFieldValue("updateScript", deviceSettings?.switchScript)
        }
    }, [deviceSettings]);
    const props: UploadProps = {
        name: 'file',
        multiple: true,
        action: '/api/files/firmwares',
        onChange: async (info) => {
            const {status} = info.file;
            if (status === "removed") {
                const {name: fileName, response: {objectName}} = info.file
                await removeFirmware({
                    objectName
                })
            } else if (status === 'done') {
                const {name: fileName, response: {objectName}} = info.file
                await addFirmware({
                    objectName,
                    fileName
                })
                if (devices) {
                    for (let device of devices) {
                        await addSwitchFirmwareListItem({
                            deviceIp: device.deviceIp,
                            objectName,
                            fileName
                        })
                    }
                }
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
    const handleUpdateScriptSave = async ({code}: { code: any }) => {
        try {
            await updateDeviceSettings({
                switchScript: code
            })
        } catch (e) {
            console.log(e)
        }
    }
    const handleSelectAll = () => {
        form.setFieldValue("currentDevices", devices ? devices.map(device => ({
            value: device.deviceIp
        })) : [])
    }
    const handleClearSelect = () => {
        form.setFieldValue("currentDevices", [])
    }
    const handleSelectByDeviceName = (deviceName: string) => {
        form.setFieldValue("currentDevices", devices ? devices.filter(device => {
            return device.deviceName === deviceName
        }).map(device => ({
            value: device.deviceIp
        })) : [])
    }
    const handleSubmit = async (values: any) => {
        for (let currentDevice of values.currentDevices) {
            try {
                const fileUrlRes = await getFileUrl({
                    bucketName: "firmwares",
                    objectName: values.firmwareList
                }).unwrap()
                const sshConfig = await getSshConfig({
                    deviceIp: currentDevice
                }).unwrap()
                await createConcurrentTask({
                    title: `批量更新-${currentDevice}`,
                    description: "切换固件版本",
                    taskType: "ssh",
                    script: values.updateScript,
                    templateVariables: {
                        FILE_URL: fileUrlRes.url
                    },
                    environment: {...sshConfig, host: currentDevice},
                    parallel: 1
                }).unwrap()
                message.success(`设备${currentDevice}加入更新队列成功！`)
            } catch (e: any) {
                console.log(e)
            }
        }
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
                <Form form={form} {...layout} onValuesChange={handleValuesChange} onFinish={handleSubmit}>
                    <Form.Item label="批量选择设备">
                        {
                            Array.from(deviceNames).map((deviceName, index) => {
                                return (
                                    <Button
                                        key={index}
                                        type="primary"
                                        style={{marginLeft: 10}}
                                        onClick={() => handleSelectByDeviceName(deviceName)}>选中{deviceName}
                                    </Button>
                                )
                            })
                        }
                    </Form.Item>
                    <Form.Item label="设备" className={styles.selectAllDeviceIpSelect}>
                        <Form.Item name="currentDevices"
                                   rules={[{required: true, message: '请选择需要切换固件的设备!'}]}>
                            <Select
                                mode="multiple"
                                options={devices ? devices.map(device => ({
                                    label: `${device.deviceIp}-${device.deviceName}`,
                                    value: device.deviceIp
                                })) : []}
                                optionFilterProp="label"
                                showSearch={true}
                            />
                        </Form.Item>
                        <Button type="primary" style={{marginLeft: 10}} onClick={handleSelectAll}>全选</Button>
                        <Button type="primary" danger style={{marginLeft: 10}}
                                onClick={handleClearSelect}>清空选择</Button>
                    </Form.Item>
                    <Form.Item label="固件" name="firmwareList"
                               rules={[{required: true, message: '请选择需要切换的固件!'}]}>
                        <Select
                            options={deviceSettings ? deviceSettings.firmwareList.map((firmware) => {
                                return {
                                    value: firmware.objectName,
                                    label: firmware.fileName
                                }
                            }) : []}
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
