"use client"
import React from 'react';
import {Card, FormProps, message} from 'antd';
import {Button, Form, Input} from 'antd';
import Link from "next/link";
import {useSendForgetPasswordEmailMutation} from "@/services/users";

type FieldType = {
    email?: string;
};

export interface ForgetPasswordRequest {
    email: string;
}

const Login: React.FC = () => {
    const [sendForgetPasswordEmail] = useSendForgetPasswordEmailMutation()
    const onFinish: FormProps<ForgetPasswordRequest>['onFinish'] = async (values) => {
        try {
            await sendForgetPasswordEmail(values).unwrap()
            message.success("重置链接已经发送到邮箱，请注意查收！")
        } catch (error: any) {
            // @ts-ignore
            message.error("重置链接发送失败,请稍后再试！")
        }
    };
    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh"}}>
            <Card title={"忘记密码"}>
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
                        label="邮箱"
                        name="email"
                        required={true}
                        rules={[{required: true, message: '请输入用户名'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item labelCol={{span: 0}} wrapperCol={{offset: 8, span: 16}}>

                        <Button type="primary" htmlType="submit">
                            重置密码
                        </Button>
                        <span style={{marginLeft: 24}}>
                            还没有账号？去<Link href="/register">注册</Link>&nbsp;或&nbsp;<Link href="/login">登录</Link>
                        </span>
                    </Form.Item>
                </Form>
            </Card>

        </div>

    )
}

export default Login;