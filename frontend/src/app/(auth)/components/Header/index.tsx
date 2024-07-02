import React from 'react';
import {DashboardOutlined} from "@ant-design/icons";
import UserAvatarDropdown from "@/app/(auth)/components/Header/UserAvatarDropdown";
import TaskDropdown from "@/app/(auth)/components/Header/TaskDropdown";

function Header({setIsAddDeviceModalOpen}: { setIsAddDeviceModalOpen: (open: boolean) => void }) {

    return (
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
                <TaskDropdown/>
                <UserAvatarDropdown setIsAddDeviceModalOpen={setIsAddDeviceModalOpen}/>
            </div>
        </div>
    );
}

export default Header;