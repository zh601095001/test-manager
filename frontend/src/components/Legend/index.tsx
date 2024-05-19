"use client"
import React from 'react';

function Legend() {
    return (
        <>
            <div className="legend">
                <div className="item">
                    <div className="color-box automated"></div>
                    <span>自动化测试</span>
                </div>
                <div className="item">
                    <div className="color-box manual"></div>
                    <span>手工测试</span>
                </div>
                <div className="item">
                    <div className="color-box maintenance"></div>
                    <span>维护</span>
                </div>
            </div>
        </>
    );
}

export default Legend;