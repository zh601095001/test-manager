"use client"
import {List} from 'antd';
import React from 'react';
import {useSelector} from "react-redux";
import {selectHarbors} from "@/features/websocket/websocketSlice";

interface Harbor {
    imageName: string;
    info: {
        fullImageName: string;
        version: string;
    };
}

function HarborList() {
    const harbors: Harbor[] = useSelector(selectHarbors)
    return (
        <div>
            <List
                header={<div>当前镜像版本</div>}
                bordered
                dataSource={harbors}
                renderItem={(harbor) => (
                    <List.Item>
                        <div>
                            <span style={{marginRight: 20, fontWeight: "bold"}}>{harbor.imageName}</span>
                            <span style={{fontSize: 18}}>
                                {`${harbor?.info?.fullImageName}:${harbor?.info?.version}`}
                            </span>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
}

export default HarborList;