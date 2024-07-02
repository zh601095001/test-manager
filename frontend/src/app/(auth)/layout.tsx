"use client"
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentUser, setCredentials, selectCurrentRoles} from "@/features/auth/authSlice";
import {useRouter} from 'next/navigation'; // 确保正确引用next/router
import {Avatar, Dropdown, message, Modal, Form, Input, Empty} from "antd";
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
import {useGetTasksMutation} from "@/services/task";
import styles from "./index.module.scss"

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
    const [taskItems, setTaskItems] = useState<MenuProps['items']>([])
    const [getTasks] = useGetTasksMutation()


    useEffect(() => {
        (async () => {
            try {
                const data = await refreshToken().unwrap();
                if (data.accessToken) {
                    dispatch(setCredentials(data));
                }
            } catch (e) {
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

    const handleMenuClick = ({key}: { key: string }) => {
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
    const handleTaskMenuClick = async () => {
        const tasks = await getTasks({
            title: "(switchFirmware|批量更新)",
            limit: 100
        }).unwrap()
        console.log(tasks[0])
        const taskItems = tasks.map((task: any) => {
            const {createdAt} = task
            const createdAtDate = new Date(createdAt)
            const createdAtDateStr = createdAtDate.toLocaleString("zh-CN", {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false,
                timeZone: "Asia/Shanghai" // 设置时区为 GMT+8
            });
            const currentTime = new Date();
            const timeDiff = currentTime.getTime() - createdAtDate.getTime();
            const hours = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60)));
            const minutes = Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)));
            const seconds = Math.max(0, Math.floor((timeDiff % (1000 * 60)) / 1000));
            const raw_seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            // @ts-ignore
            let iconSvg = {
                // 'pending' | 'running' | 'completed' | 'failed'
                "pending": "pending.svg",
                "running": "running.svg",
                "failed": "failed.svg",
                "completed": "finished.svg"
            }[task.status]
            if (raw_seconds < 0) {
                iconSvg = "pending.svg"
            }
            return {
                key: task._id,
                label: (
                    <div style={{}}>
                        <div style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "80%"
                        }}
                        >
                            {task.title}
                        </div>
                        <div style={{fontSize: 10, color: "#d8d8d8"}}>
                            <span>创建于:{createdAtDateStr}</span>
                            <span
                                style={{marginLeft: 10}}
                            >
                                用时:{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                            </span>
                        </div>
                    </div>
                ),
                icon: <img src={iconSvg} width={20} alt=""/>,
            }
        })
        setTaskItems(taskItems)
    }
    const handleTaskMenuItemClick = ()=>{

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
                <div style={{display: "flex", alignItems: "center"}}>
                    <Dropdown
                        overlayClassName={styles.taskItemList}
                        menu={{items: taskItems,onClick: handleTaskMenuItemClick}}
                        trigger={["click"]}
                        placement="bottomCenter"
                        overlayStyle={{width: 300}}
                        dropdownRender={(originNode) => {
                            console.log(originNode)
                            // @ts-ignore
                            if (!originNode?.props?.items?.length) {
                                return <div style={{
                                    height: 450,
                                    background: "white",
                                    boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.08),0 3px 6px -4px rgba(0, 0, 0, 0.12),0 9px 28px 8px rgba(0, 0, 0, 0.05)",
                                    borderRadius: 8,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无任务"/></div>
                            }
                            return originNode
                        }}
                    >
                        <div
                            style={{display: "flex", alignItems: "center"}}
                            onClick={handleTaskMenuClick}
                        >
                            <img src="task.svg" alt="" width={30}/>
                            <span style={{marginRight: 40}}>任务</span>
                        </div>
                    </Dropdown>
                    <Dropdown
                        menu={{items, onClick: handleMenuClick}}
                        trigger={["click"]}
                        placement="bottomCenter"
                        overlayStyle={{width: 150}}
                    >
                        <div style={{display: "flex", alignItems: "center"}}>
                            <Avatar size="default" icon={<UserOutlined/>}/>
                            <span style={{marginLeft: 10}}>{user}</span>
                        </div>
                    </Dropdown>
                </div>
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
