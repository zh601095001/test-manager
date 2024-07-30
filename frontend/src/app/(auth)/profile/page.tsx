"use client"
import React, {useEffect, useState} from 'react';
import {Avatar, Button, Form, Input, Upload, message, Tag} from "antd";
import {UploadOutlined, UserOutlined} from "@ant-design/icons";
import {UploadProps} from 'antd/es/upload';
import styles from "./index.module.scss"
import {
    useChangePasswordMutation,
    useUpdateAvatarMutation,
    useUpdateEmailMutation,
    useUserQuery
} from "@/services/profile";

interface FormValues {
    email: string;
    oldPassword?: string;
    newPassword?: string;
    avatar?: string;
}

const Profile: React.FC = () => {
    const [form] = Form.useForm<FormValues>();
    const {data: user, error, isLoading} = useUserQuery()
    const [updateAvatar] = useUpdateAvatarMutation()
    const [updateEmail] = useUpdateEmailMutation()
    const [changePassword] = useChangePasswordMutation()
    const [avatarUrl, setAvatarUrl] = useState<string>("");

    useEffect(() => {
        form.setFieldValue("currentEmail", user?.email);
    }, [user]);
    if (!user || isLoading) return <p>Loading...</p>;
    // @ts-ignore
    if (error) return <p>Error: {error?.message}</p>;

    const uploadProps: UploadProps = {
        name: 'file',
        action: '/api/files/devicepool',
        showUploadList: false,
        beforeUpload(file) {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('You can only upload JPG/PNG file!');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Image must smaller than 2MB!');
            }
            return isJpgOrPng && isLt2M;
        },
        onChange(info) {
            if (info.file.status === 'done') {
                form.setFieldValue("avatar", info.file.response.url)
                setAvatarUrl(info.file.response.url); // Assumes server responds with the URL
                form.setFieldsValue({avatar: info.file.response.url});
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const onFinish = async (values: FormValues) => {
        const {avatar, email, oldPassword, newPassword} = values
        if (avatar) {
            const {message: msg} = await updateAvatar({avatar}).unwrap()
            message.success(msg)
            form.resetFields(["avatar"])
        }
        if (email) {
            const {message: msg} = await updateEmail({email}).unwrap()
            message.success(msg)
            form.resetFields(["email"])
        }
        if (oldPassword && newPassword) {
            const {message: msg} = await changePassword({oldPassword, newPassword}).unwrap()
            message.success(msg)
            form.resetFields(["oldPassword", "newPassword"])
        }
    };
    const currentAvatar = (() => {
        if (avatarUrl) return avatarUrl
        return user.avatar
    })()
    return (
        <div style={{padding: "100px 200px"}} className={styles.profile}>
            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                <Form.Item label="头像">
                    <hr style={{marginTop: 0, marginBottom: 20, color: "#dcdcde"}}/>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Avatar
                            icon={!currentAvatar ? <UserOutlined/> : null}
                            src={currentAvatar || undefined}
                            size={"large"}
                            style={{marginRight: 20}}
                        />
                        <Form.Item style={{marginBottom: 0}} name="avatar" valuePropName="file">
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined/>}>上传新头像</Button>
                            </Upload>
                        </Form.Item>
                    </div>
                </Form.Item>
                <Form.Item label="当前权限">
                    <hr style={{marginTop: 0, marginBottom: 20, color: "#dcdcde"}}/>
                    {
                        user.roles.map((role, index) => {
                            return <Tag color="green" key={index}>{role}</Tag>
                        })
                    }
                </Form.Item>
                <Form.Item label="邮箱">
                    <hr style={{marginTop: 0, marginBottom: 20, color: "#dcdcde"}}/>
                    <Form.Item label="当前邮箱" name="currentEmail">
                        <Input type="email" autoComplete="email" disabled/>
                    </Form.Item>
                    <Form.Item label="新邮箱" name="email" rules={[{message: '请输入邮箱!'}]}>
                        <Input autoComplete="new-password"/>
                    </Form.Item>
                </Form.Item>
                <Form.Item label="密码">
                    <hr style={{marginTop: 0, marginBottom: 20, color: "#dcdcde"}}/>
                    <Form.Item
                        name="oldPassword"
                        label="旧密码"
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="新密码"
                        rules={[
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (value && !getFieldValue('oldPassword')) {
                                        return Promise.reject(new Error('请输入旧密码!'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Input.Password autoComplete="false"/>
                    </Form.Item>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        更新设置
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default Profile;
