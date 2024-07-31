"use client"
import React, {useState} from 'react';
import {Button, Input, Table} from "antd";
import EditableRow from "./EditableRow";
import EditableCell from "./EditableRow/EditableCell";
import {
    useDeleteUserByAdminMutation,
    useGetUsersQuery,
    useUpdateEmailByAdminMutation,
    useUpdatePasswordByAdminMutation,
    useUpdateRolesByAdminMutation
} from "@/services/api";


interface User {
    _id: string,
    username: string;
    email: string;
    roles: string[];
    avatar?: string;
    settings?: {
        deviceFilters?: any[];
    };
    password?: string
}

type EditableTableProps = Parameters<typeof Table>[0];
type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const UsersTable: React.FC = () => {
    const {data: users, isLoading} = useGetUsersQuery();
    const [searchText, setSearchText] = useState("");
    const [pagination, setPagination] = useState({current: 1, pageSize: 20});
    const [updateEmailByAdmin] = useUpdateEmailByAdminMutation()
    const [updateRolesByAdmin] = useUpdateRolesByAdminMutation()
    const [updatePasswordByAdmin] = useUpdatePasswordByAdminMutation()
    const [deleteUserByAdmin] = useDeleteUserByAdminMutation()

    if (!users || isLoading) return <div>Loading...</div>;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setPagination({...pagination, current: 1});
    };

    const handleTableChange = (pagination: any) => {
        setPagination(pagination);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchText.toLowerCase())
    );

    const defaultColumns: (ColumnTypes[number] & {
        editable?: boolean;
        dataIndex?: string,
        inputType?: string,
        options?: string[]
    })[] = [
        {
            title: '用户名',
            dataIndex: 'username',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            render: (value) => (
                <div>{value ? value : "-"}</div>
            ),
            editable: true
        },
        {
            title: '权限',
            dataIndex: 'roles',
            editable: true,
            inputType: "select",
            options: ["admin", "user", "tester", "guest"],
            render: (value) => (
                <div>{value.length ? value.join(",") : "-"}</div>
            ),
        },
        {
            title: '密码',
            dataIndex: 'password',
            editable: true,
            render: () => (
                <div>******</div>
            ),
        },
        {
            title: '操作',
            render: (_, record, index) => (
                <Button type="primary" danger onClick={() => {
                    deleteUserByAdmin({_id: record._id})
                }}>删除用户</Button>
            ),
        },
    ];


    const handleSave = (row: User) => {
        console.log(row);
        const {_id, email, roles, password} = row
        if (email !== undefined) {
            updateEmailByAdmin({_id, email})
        }
        if (roles !== undefined) {
            updateRolesByAdmin({_id, roles})
        }
        if (password !== undefined) {
            updatePasswordByAdmin({_id, newPassword: password})
        }
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
            onCell: (record: User) => ({
                record,
                editable: col.editable,
                inputType: col.inputType,
                options: col.options,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });

    return (
        <div>
            <Input
                placeholder="搜索用户名"
                value={searchText}
                onChange={handleSearch}
                style={{marginBottom: 20}}
            />
            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                dataSource={filteredUsers}
                columns={columns as ColumnTypes}
                bordered={false}
                rowKey="username"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    pageSizeOptions: [10, 20, 50, 100],
                    showSizeChanger: true,
                    showQuickJumper: true,
                    total: filteredUsers.length,
                }}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default UsersTable;
