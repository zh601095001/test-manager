import React from 'react';
import {Avatar, Dropdown, type MenuProps, message} from "antd";
import {DatabaseOutlined, LogoutOutlined, SettingOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import {useLogoutMutation} from "@/services/auth";
import {useWebSocket} from "@/components/WebsocketProvider";
import {useSelector} from "react-redux";
import {selectCurrentRoles, selectCurrentUser} from "@/features/auth/authSlice";

function UserAvatarDropdown({setIsAddDeviceModalOpen}: { setIsAddDeviceModalOpen: (open: boolean) => void }) {
    const user = useSelector(selectCurrentUser);
    const router = useRouter();
    const roles = useSelector(selectCurrentRoles);
    const [logout] = useLogoutMutation();
    const wsContext = useWebSocket()
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
                setIsAddDeviceModalOpen(true)
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
    return (
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
    );
}

export default UserAvatarDropdown;