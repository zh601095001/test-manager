"use client"
import React from 'react';
import {useSelector} from "react-redux";
import {isLoadingVisibleSelector} from "@/features/loading/loadingSlice";

function LoadingOverlay({children}: { children: React.ReactNode }) {
    const isLoading = useSelector(isLoadingVisibleSelector);
    return (
        <>
            <div id="loading-overlay" style={{display: isLoading ? 'flex' : 'none'}}>
                <div className="loading-spinner"></div>
                <div style={{color: "white", fontWeight: "bold", marginLeft: 10}}>加载中...</div>
            </div>
            {children}
        </>

    );
}

export default LoadingOverlay;
