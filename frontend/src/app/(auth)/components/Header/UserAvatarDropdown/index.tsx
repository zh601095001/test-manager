import React from 'react';
import {Avatar, Dropdown, type MenuProps, message} from "antd";
import {DatabaseOutlined, LogoutOutlined, SettingOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import {useLogoutMutation} from "@/services/api";
import {useWebSocket} from "@/components/WebsocketProvider";
import {useUserQuery} from "@/services/api";

function UserAvatarDropdown({setIsAddDeviceModalOpen}: { setIsAddDeviceModalOpen: (open: boolean) => void }) {
    const {data: user, isLoading} = useUserQuery()
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const wsContext = useWebSocket()
    const isAdmin = user?.roles && user?.roles.includes("admin");

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: "用户管理",
            icon: <TeamOutlined/>,
            disabled: !isAdmin, // 根据isAdmin状态禁用或启用
        },
        {
            key: "2",
            label: "用户信息",
            icon: <UserOutlined />
        },
        {
            key: "3",
            label: "系统设置",
            icon: <SettingOutlined/>,
            disabled: !isAdmin, // 根据isAdmin状态禁用或启用
        },
        {
            type: 'divider',
        },
        {
            key: "4",
            label: "添加设备",
            icon: <DatabaseOutlined/>,
            disabled: !isAdmin, // 根据isAdmin状态禁用或启用
        },
        {
            type: 'divider',
        },
        {
            key: '5',
            danger: true,
            label: '退出登录',
            icon: <LogoutOutlined/>,
        },
    ];

    const handleMenuClick = ({key}: { key: string }) => {
        switch (key) {
            case "1":
                router.push("/users")
                break
            case "2":
                router.push("/profile")
                break;
            case "3":
                router.push("/settings")
                break;
            case "4":
                setIsAddDeviceModalOpen(true)
                break;
            case "5":
                // @ts-ignore
                logout();
                message.success("注销成功");
                wsContext?.disconnect()
                router.push("/login")
                break;
        }
    };
    if (isLoading) return <div>Loading</div>
    return (
        <Dropdown
            menu={{items, onClick: handleMenuClick}}
            trigger={["click"]}
            placement="bottomCenter"
            overlayStyle={{width: 150}}
        >
            <div style={{display: "flex", alignItems: "center"}}>
                <Avatar
                    size="default"
                    icon={!user?.avatar ? <UserOutlined/> : undefined}
                    src={user?.avatar ? user.avatar : ""}
                />
                <span style={{marginLeft: 10}}>{user?.username}</span>
            </div>
        </Dropdown>
    );
}

export default UserAvatarDropdown;