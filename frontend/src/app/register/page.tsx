"use client"
import React from 'react';
import {Card, FormProps, message} from 'antd';
import {Button, Form, Input} from 'antd';
import Link from "next/link";
import {RegisterRequest, useRegisterMutation} from "@/services/api";
import {setCredentials} from "@/features/auth/authSlice";
import {useDispatch} from "react-redux";
import {useRouter} from "next/navigation";

type FieldType = {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

const Register: React.FC = () => {
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const [register] = useRegisterMutation()
    const dispatch = useDispatch()
    const router = useRouter()
    const onFinish: FormProps<RegisterRequest>['onFinish'] = async (values) => {
        try {
            const user = await register(values).unwrap()
            dispatch(setCredentials(user))
            message.success("注册成功")
            router.push("/devicepool")
        } catch (err:any) {
            message.error(err.data.toString())
        }
    };
    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh"}}>
            <Card title={"设备池管理注册"}>
                <Form
                    name="basic"
                    labelCol={{span: 4}}
                    wrapperCol={{span: 20}}
                    style={{minWidth: 600}}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item<FieldType>
                        label="用户名"
                        name="username"
                        rules={[{required: true, message: '请输入用户名'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="邮箱"
                        name="email"
                        rules={[
                            {required: true, message: '请输入邮箱'},
                            {type: 'email', message: '请输入有效的邮箱地址'},
                        ]}
                    >
                        <Input/>
                    </Form.Item>

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
                                message: '请确认您的密码！',
                            },
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不匹配'));
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
                            注册
                        </Button>
                        <span style={{marginLeft: 24}}>
                            已有账号？去<Link href="/login">登录</Link>&nbsp;或&nbsp;<Link href="/forget-password">忘记密码</Link>
                        </span>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default Register;
