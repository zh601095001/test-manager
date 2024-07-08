import React from 'react';
import {DashboardOutlined, DownOutlined, MenuOutlined} from "@ant-design/icons";
import UserAvatarDropdown from "@/app/(auth)/components/Header/UserAvatarDropdown";
import TaskDropdown from "@/app/(auth)/components/Header/TaskDropdown";
import {Dropdown, message,} from "antd";
import type {MenuProps} from "antd"
import {usePathname, useRouter} from "next/navigation";

function Header({setIsAddDeviceModalOpen}: { setIsAddDeviceModalOpen: (open: boolean) => void }) {
    const pathname = usePathname();
    const router = useRouter()
    const items: MenuProps['items'] = [
        {
            label: <div>设备池管理</div>,
            key: "1"
        },
        {
            label: <div>Runner管理</div>,
            key: "2"
        }
    ]
    const handleMenuChange = ({key}: { key: string }) => {
        switch (key) {
            case "1":
                router.push("/devicepool")
                break
            case "2":
                router.push("/runnerpool")
        }
    }
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            padding: "10px 50px",
            boxSizing: "border-box",
            alignItems: "center"
        }}>
            <Dropdown menu={{items, onClick: handleMenuChange}} overlayStyle={{width: 200}} trigger={["click"]}>
                <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <span style={{display: "flex", alignItems: "center"}}>
                        <DashboardOutlined style={{fontSize: 20, marginRight: 10}}/>
                        {
                            pathname.startsWith("/devicepool") ? "设备池管理" :
                                pathname.startsWith("/runnerpool") ? "Runner管理" : ""
                        }
                    </span>
                    <MenuOutlined
                        style={{display: "inline-block", color: "#0077d9", marginLeft: 10, paddingTop: 2}}/>
                </div>
            </Dropdown>
            <div style={{display: "flex", alignItems: "center"}}>
                <TaskDropdown/>
                <UserAvatarDropdown setIsAddDeviceModalOpen={setIsAddDeviceModalOpen}/>
            </div>
        </div>
    );
}

export default Header;