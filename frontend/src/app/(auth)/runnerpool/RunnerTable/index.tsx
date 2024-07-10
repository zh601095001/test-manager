"use client"
import React, {useState} from 'react';
import {useSelector} from "react-redux";
import {Table} from "antd"
import EditableRow from "./EditableRow";
import EditableCell from "./EditableRow/EditableCell";
import {selectCurrentRoles} from "@/features/auth/authSlice";
import {PlusSquareOutlined} from "@ant-design/icons";
import AddRunnerModel from "@/app/(auth)/runnerpool/RunnerTable/AddRunnerModel";


type EditableTableProps = Parameters<typeof Table>[0];
type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const DeviceTable: React.FC = () => {
    const roles = useSelector(selectCurrentRoles)
    const [isAddRunnerModelOpen, setIsAddRunnerModelOpen] = useState<boolean>(false)
    const source: any = []
    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
            title: '名称',
            dataIndex: 'runnerName',
            editable: !!(roles && roles.includes("admin")),
        },
        {
            title: 'ip地址',
            dataIndex: 'runnerIp',
        },
        {
            title: '端口号',
            dataIndex: 'runnerPort',
            editable: !!(roles && roles.includes("admin"))
        },
        {
            title: '状态',
            dataIndex: 'status',
        },
        {
            title: '标签',
            dataIndex: 'tags',
        },
        {
            title: '备注',
            dataIndex: 'comment',
            editable: !!(roles && roles.includes("admin"))
        },
        {
            title: (
                <div style={{display: "flex"}}>
                    <span>操作</span>
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: 20,
                            color: "#1677ff!important",
                            cursor: "pointer"
                        }}
                        onClick={() => setIsAddRunnerModelOpen(true)}
                    >
                        <PlusSquareOutlined style={{fontSize: 20,}}/>
                        添加Runner
                    </span>
                </div>
            ),
            dataIndex: 'operation',
            render: (_, record) => {

                return <div></div>
            },
        }
    ];

    const handleSave = (row: any) => {
    };

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: any) => {
                return {
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave,
                }
            },
        };
    });


    return (
        <div>
            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                dataSource={source}
                columns={columns as ColumnTypes}
                bordered={false}
                rowHoverable={false}
                rowKey="deviceIp"
                pagination={{pageSize: 100, pageSizeOptions: [50, 100]}}
            />
            <AddRunnerModel open={isAddRunnerModelOpen} setOpen={setIsAddRunnerModelOpen}/>
        </div>
    );
};

export default DeviceTable