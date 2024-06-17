"use client"
import React, {useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {selectDevices} from "@/features/websocket/websocketSlice";
import {Button, Modal, Popconfirm, Table, Form, Input} from "antd"
import EditableRow from "@/components/DeviceTable/EditableRow";
import EditableCell from "@/components/DeviceTable/EditableCell";
import {selectCurrentRoles, selectCurrentUser} from "@/features/auth/authSlice";
import {
    useLockByDeviceIpMutation,
    useReleaseDeviceByIpMutation,
    useRemoveDeviceByIpMutation, useUpdateDeviceMutation
} from "@/services/devicePool";

// 定义设备对象的接口
interface Device {
    deviceName: string;
    deviceIp: string;
    deviceMac: string;
    deviceFirmware: string | null;
    lockTime: string | null;
    duration: string | null;
    user: string;
    comment: string;
    status: "locked" | "unlocked" | "maintained";
}


type EditableTableProps = Parameters<typeof Table>[0];
type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const DeviceTable: React.FC = () => {
    const allDevices: Device[] = useSelector(selectDevices);
    const roles = useSelector(selectCurrentRoles)
    const user = useSelector(selectCurrentUser)
    const [releaseDeviceByIp] = useReleaseDeviceByIpMutation()
    const [lockByDeviceIp] = useLockByDeviceIpMutation()
    const [removeDeviceByIp] = useRemoveDeviceByIpMutation()
    const [updateDevice] = useUpdateDeviceMutation()
    const [form] = Form.useForm()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMaintainDeviceIp, setCurrentMaintainDeviceIp] = useState("")

    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
            title: '设备名称',
            dataIndex: 'deviceName',
            editable: !!(roles && roles.includes("admin")),
        },
        {
            title: '设备ip地址',
            dataIndex: 'deviceIp',
        },
        {
            title: '设备mac地址',
            dataIndex: 'deviceMac',
            editable: !!(roles && roles.includes("admin"))
        },
        {
            title: '固件版本',
            dataIndex: 'deviceFirmware',
        },
        {
            title: '锁定起始时间',
            dataIndex: 'lockTime',
        },
        {
            title: '耗时',
            dataIndex: 'duration',
        },
        {
            title: '使用者',
            dataIndex: 'user',
            editable: !!(roles && roles.includes("admin"))
        },
        {
            title: '备注',
            dataIndex: 'comment',
            editable: !!(roles && roles.includes("admin"))
        },
        {
            title: '操作',
            dataIndex: 'operation',
            filters: [
                {
                    text: '可用',
                    value: 'unlocked',
                },
                {
                    text: '其他用户锁定',
                    value: 'locked',
                },
                {
                    text: '维护',
                    value: 'maintained',
                },
                {
                    text: "自动化测试",
                    value: "自动化测试"
                }
            ],
            defaultFilteredValue: ["unlocked"],
            onFilter: (value, record) => {
                if (value === "自动化测试" && record.status === "locked") {
                    return record.comment === value
                } else if (value === "unlocked") {
                    return record.status.indexOf(value as string) === 0 || record.user === user;
                } else if (value === "locked") {
                    return record.status.indexOf(value as string) === 0 && record.user !== user;
                } else {
                    return record.status.indexOf(value as string) === 0
                }
            },
            render: (_, record) => {
                const {status} = record
                const deviceUser = record.user
                const deviceIp = record.deviceIp
                const isCurrentUser = deviceUser === user
                const isAdmin = roles && roles.includes("admin")
                const isMaintained = status === "maintained" || (status === "locked" && !isCurrentUser)
                // @ts-ignore
                let operation = {
                    "locked": {
                        text: "释放",
                        show: isAdmin || isCurrentUser,
                        action: () => releaseDeviceByIp({deviceIp}),
                        backgroundColor: "#28a324"
                    },
                    "automated": {
                        text: "释放",
                        show: true,
                        action: () => releaseDeviceByIp({deviceIp}),
                        backgroundColor: "#28a324"
                    },
                    "unlocked": {
                        text: "锁定",
                        show: true,
                        action: () => lockByDeviceIp({deviceIp, user: user || ""})
                    },
                    "maintained": {
                        text: "解除维护",
                        show: isAdmin,
                        action: () => releaseDeviceByIp({deviceIp})
                    }
                }[status]
                return allDevices.length >= 1 ? (
                    <div>
                        {
                            operation.show ? (
                                <Popconfirm
                                    title={`确定要${operation.text}?`}
                                    okText="确认"
                                    cancelText="取消"
                                    onConfirm={operation.action}
                                >
                                    <Button type="primary" style={{
                                        marginRight: 10,
                                        background: operation.backgroundColor
                                    }}>{operation.text}</Button>
                                </Popconfirm>
                            ) : ""
                        }

                        {
                            !isMaintained ? <Button type="primary" style={{marginRight: 10, backgroundColor: "#efe50c"}}
                                                    onClick={() => handleMaintain(deviceIp)}>报告问题</Button> : ""
                        }

                        {
                            isAdmin ? (
                                <Popconfirm
                                    title="确定要删除?"
                                    okText="确认"
                                    cancelText="取消"
                                    onConfirm={() => removeDeviceByIp({deviceIp})}
                                >
                                    <Button type="primary" danger style={{marginRight: 10}}>删除</Button>
                                </Popconfirm>
                            ) : ""
                        }
                    </div>
                ) : null
            },
        }
    ];

    const handleSave = (row: Device) => {
        updateDevice({
            deviceIp: row.deviceIp,
            deviceName: row.deviceName,
            comment: row.comment,
            deviceMac: row.deviceMac,
            user: row.user
        })
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
            onCell: (record: Device) => {
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

    const handleMaintain = (deviceIp: string) => {
        setCurrentMaintainDeviceIp(deviceIp)
        setIsModalOpen(true)
    }
    const handleMaintainModal = () => {
        form.validateFields().then(({comment}: any) => {
            updateDevice({
                deviceIp: currentMaintainDeviceIp,
                comment,
                status: "maintained"
            })
            setIsModalOpen(false)
        })
    }

    return (
        <div>
            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                dataSource={allDevices}
                columns={columns as ColumnTypes}
                bordered={false}
                rowHoverable={false}
                rowKey="deviceIp"
                pagination={{pageSize: 100, pageSizeOptions: [50, 100]}}
            />
            <Modal
                title={"维护"}
                open={isModalOpen}
                onOk={handleMaintainModal}
                onCancel={() => setIsModalOpen(false)}
                okText="添加"
                cancelText="取消"
            >
                <Form form={form}>
                    <Form.Item
                        name="comment"
                        label="问题"
                        labelCol={{span: 8}}
                        wrapperCol={{span: 16}}
                        rules={[{required: true, message: '请输入错误原因'}]}
                    >
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DeviceTable