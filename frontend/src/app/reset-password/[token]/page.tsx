"use client"
import React from 'react';
import {Card, FormProps, message} from 'antd';
import {Button, Form, Input} from 'antd';
import {useResetPasswordMutation, useSendForgetPasswordEmailMutation} from "@/services/api";
import {useRouter} from "next/navigation";

type FieldType = {
    password?: string;
    confirmPassword?: string
};

export interface ResetPasswordRequest {
    password: string;
}

const ResetPassword = ({params}: { params: { token: string } }) => {
    const [resetPassword] = useResetPasswordMutation()
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const router = useRouter()

    const onFinish: FormProps<ResetPasswordRequest>['onFinish'] = async ({password}) => {
        try {
            await resetPassword({newPassword: password, token: params.token}).unwrap()
            message.success("密码重置成功！")
            router.push("/login")
        } catch (error: any) {
            // @ts-ignore
            message.error("重置密码失败！")
        }
    };
    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh"}}>
            <Card title={"重置密码"}>
                <Form
                    name="basic"
                    labelCol={{span: 4}}
                    wrapperCol={{span: 20}}
                    style={{minWidth: 600}}
                    initialValues={{remember: true}}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item<FieldType>
                        label="密码"
                        name="password"
                        rules={[{required: true, message: '请输入密码'}]}
                    >
                        <Input.Password
                            visibilityToggle={{visible: passwordVisible, onVisibleChange: setPasswordVisible}}
                        />
                    </Form.Item>
                    <Form.Item<FieldType>
                        label="确认密码"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            {
                                required: true,
                                message: 'Please confirm your password!',
                            },
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('新输入的密码与之前不匹配'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            visibilityToggle={{visible: passwordVisible, onVisibleChange: setPasswordVisible}}
                        />
                    </Form.Item>

                    <Form.Item labelCol={{span: 0}} wrapperCol={{offset: 8, span: 16}}>

                        <Button type="primary" htmlType="submit">
                            重置密码
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

        </div>

    )
}

export default ResetPassword;