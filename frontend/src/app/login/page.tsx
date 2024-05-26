"use client"
import React from 'react';
import {Card, FormProps, message} from 'antd';
import {Button, Form, Input} from 'antd';
import Link from "next/link";
import {LoginRequest, useLoginMutation} from "@/services/auth";
import {useDispatch} from "react-redux";
import {setCredentials} from "@/features/auth/authSlice";
import {useRouter} from "next/navigation";
import {useWebSocket} from "@/components/WebsocketProvider";

type FieldType = {
    username?: string;
    password?: string;
};

const Login: React.FC = () => {
    const [login] = useLoginMutation()
    const dispatch = useDispatch()
    const router = useRouter()
    const wsContext = useWebSocket()
    const onFinish: FormProps<LoginRequest>['onFinish'] = async (values) => {
        try {
            const user = await login(values).unwrap()
            dispatch(setCredentials(user))
            message.success("登录成功")
            await router.push("/devicepool")
            wsContext?.connect()
        } catch (err) {
            // @ts-ignore
            message.error("用户名或密码错误")
        }
    };
    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh"}}>
            <Card title={"设备池管理登录"}>
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
                        label="用户名"
                        name="username"
                        required={false}
                        rules={[{required: true, message: '请输入用户名'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="密码"
                        name="password"
                        required={false}
                        rules={[{required: true, message: '请输入密码'}]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item labelCol={{span: 0}} wrapperCol={{offset: 8, span: 16}}>

                        <Button type="primary" htmlType="submit">
                            登录
                        </Button>
                        <span style={{marginLeft: 24}}>
                            还没有账号？去<Link href="/register">注册</Link>
                        </span>
                    </Form.Item>
                </Form>
            </Card>

        </div>

    )
}

export default Login;