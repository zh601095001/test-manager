"use client"
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentUser, setCredentials, selectCurrentRoles} from "@/features/auth/authSlice";
import {useRouter} from 'next/navigation'; // 确保正确引用next/router
import {Avatar, Dropdown, message, Modal, Form, Input} from "antd";
import {
    DashboardOutlined,
    DatabaseOutlined,
    LogoutOutlined,
    SettingOutlined,
    TeamOutlined,
    UserOutlined
} from "@ant-design/icons";
import type {MenuProps} from 'antd';
import {useLogoutMutation, useRefreshTokenMutation} from "@/services/auth";
import {useAddDeviceMutation} from "@/services/devicePool";
import {useWebSocket} from "@/components/WebsocketProvider";

export default function AuthLayout({children}: {
    children: React.ReactNode
}) {
    const user = useSelector(selectCurrentUser);
    const roles = useSelector(selectCurrentRoles);
    const router = useRouter();
    const dispatch = useDispatch();
    const [logout] = useLogoutMutation();
    const [addDevice] = useAddDeviceMutation()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm()
    const wsContext = useWebSocket()
    const [refreshToken] = useRefreshTokenMutation()

    useEffect(() => {
        (async ()=>{
            try{
                const data = await refreshToken().unwrap();
                if (data.accessToken){
                    dispatch(setCredentials(data));
                }
            }catch (e){
                message.error("认证失败或登录信息已经过期，请重新登录！")
                router.push("/login");
            }
        })()
    }, [dispatch, router]);

    const isAdmin = roles && roles.includes("admin");

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: "用户管理",
            icon: <TeamOutlined/>,
            disabled: !isAdmin, // 根据isAdmin状态禁用或启用
        },
        {
            key: "2",
            label: "个人设置",
            icon: <SettingOutlined/>
        },
        {
            type: 'divider',
        },
        {
            key: "3",
            label: "添加设备",
            icon: <DatabaseOutlined/>,
            disabled: !isAdmin, // 根据isAdmin状态禁用或启用
        },
        {
            type: 'divider',
        },
        {
            key: '4',
            danger: true,
            label: '退出登录',
            icon: <LogoutOutlined/>,
        },
    ];
    // @ts-ignore
    const handleMenuClick = ({key}) => {
        switch (key) {
            case "3":
                setIsModalOpen(true)
                break;
            case "4":
                // @ts-ignore
                logout();
                message.success("注销成功");
                wsContext?.disconnect()
                router.push("/login")
                break;
        }
    };
    const handleOk = () => {
        form.validateFields().then(({deviceName, deviceIp, deviceMac}) => {
            addDevice({deviceName, deviceIp, deviceMac})
            setIsModalOpen(false)
        })
    }

    return (
        <>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                padding: "10px 50px",
                boxSizing: "border-box",
                alignItems: "center"
            }}>
                <span style={{display: "flex", alignItems: "center"}}>
                    <DashboardOutlined style={{fontSize: 20, marginRight: 10}}/>
                    设备池管理
                </span>
                <Dropdown
                    menu={{items, onClick: handleMenuClick}}
                    trigger={["click"]}
                    placement="bottomRight"
                    overlayStyle={{width: 150}}
                >
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Avatar size="default" icon={<UserOutlined/>}/>
                        <span style={{marginLeft: 10}}>{user}</span>
                    </div>
                </Dropdown>
            </div>
            <div style={{width: "100%", padding: "10px 50px", boxSizing: "border-box"}}>
                {children}
            </div>
            <Modal
                title="添加设备"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                okText="添加"
                cancelText="取消"
            >
                <Form form={form}>
                    <Form.Item
                        name="deviceName"
                        label="设备名"
                        labelCol={{span: 8}}
                        wrapperCol={{span: 16}}
                        rules={[{required: true, message: '请输入设备名'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="deviceIp"
                        label="设备ip"
                        labelCol={{span: 8}}
                        wrapperCol={{span: 16}}
                        rules={[{required: true, message: '请输入设备ip'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="deviceMac"
                        label="设备mac地址"
                        labelCol={{span: 8}}
                        wrapperCol={{span: 16}}
                        rules={[{required: true, message: '请输入设备mac地址'}]}
                    >
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
