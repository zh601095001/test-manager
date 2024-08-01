"use client";
import React, { useEffect } from 'react';
import { Button, Form, Input } from "antd";
import styles from "./index.module.scss";
import { useGetEmailSettingsQuery, useSaveEmailSettingsMutation } from "@/services/api";

function Page() {
    const [form] = Form.useForm();
    const { data: emailSettings, isLoading } = useGetEmailSettingsQuery();
    const [saveEmailSettings, { isLoading: isSaving }] = useSaveEmailSettingsMutation();

    useEffect(() => {
        if (emailSettings) {
            form.setFieldsValue({
                emailHost: emailSettings.emailHost,
                emailPort: emailSettings.emailPort,
                emailAuthUser: emailSettings.emailAuthUser,
                emailAuthPass: emailSettings.emailAuthPass,
            });
        }
    }, [emailSettings, form]);

    const onFinish = async (values: any) => {
        try {
            await saveEmailSettings(values).unwrap();
            console.log('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    return (
        <div style={{ padding: "100px 200px" }} className={styles.settings}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    emailHost: '',
                    emailPort: '',
                    emailAuthUser: '',
                    emailAuthPass: '',
                }}
            >

                <Form.Item
                    name="emailHost"
                    label="邮件服务器主机"
                    rules={[{ required: true, message: 'Please input the Email Host!' }]}
                >
                    <Input disabled={isLoading || isSaving} />
                </Form.Item>

                <Form.Item
                    name="emailPort"
                    label="邮件服务器端口"
                    rules={[{ required: true, message: 'Please input the Email Port!' }]}
                >
                    <Input disabled={isLoading || isSaving} />
                </Form.Item>

                <Form.Item
                    name="emailAuthUser"
                    label="邮箱账号"
                    rules={[{ required: true, message: 'Please input the Email Auth User!' }]}
                >
                    <Input disabled={isLoading || isSaving} />
                </Form.Item>

                <Form.Item
                    name="emailAuthPass"
                    label="邮箱Token"
                    rules={[{ required: true, message: 'Please input the Email Auth Pass!' }]}
                >
                    <Input.Password disabled={isLoading || isSaving} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isSaving}>
                        保存
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default Page;
