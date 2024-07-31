"use client"
import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {setCredentials} from "@/features/auth/authSlice";
import {useRouter} from 'next/navigation'; // 确保正确引用next/router
import {message} from "antd";

import {useRefreshTokenMutation} from "@/services/api";
import AddDeviceModal from "@/app/(auth)/components/AddDeviceModal";
import Header from "@/app/(auth)/components/Header";

export default function AuthLayout({children}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
    const [refreshToken] = useRefreshTokenMutation()


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


    return (
        <>
            <Header setIsAddDeviceModalOpen={setIsAddDeviceModalOpen}/>
            <div style={{width: "100%", padding: "10px 50px", boxSizing: "border-box"}}>
                {children}
            </div>
            <AddDeviceModal isModalOpen={isAddDeviceModalOpen} setIsModalOpen={setIsAddDeviceModalOpen}/>
        </>
    );
}
