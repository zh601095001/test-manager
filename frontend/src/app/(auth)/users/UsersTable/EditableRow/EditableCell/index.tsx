import React, {useContext, useEffect, useRef, useState} from "react";
import {Form, Input, Select} from "antd";
import {EditableContext} from "@/context";
import type {InputRef} from "antd";
import type {BaseSelectRef} from "rc-select";

const {Option} = Select;

interface Item {
    key: string;
    name: string;
    age: string;
    address: string;
}

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof Item;
    record: Item;
    handleSave: (updatedFields: Partial<Item>) => void;
    inputType?: "input" | "select";
    options?: string[];
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
                                                                                title,
                                                                                editable,
                                                                                children,
                                                                                dataIndex,
                                                                                record,
                                                                                handleSave,
                                                                                inputType = "input",
                                                                                options = [],
                                                                                ...restProps
                                                                            }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef | BaseSelectRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing && inputRef.current) {
            if (inputType === "input") {
                (inputRef.current as InputRef).focus();
            } else {
                (inputRef.current as BaseSelectRef).focus();
            }
        }
    }, [editing, inputType]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({[dataIndex]: record[dataIndex]});
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            const updatedFields = Object.keys(values).reduce((acc, key) => {
                // @ts-ignore
                if (values[key] !== record[key]) {
                    // @ts-ignore
                    acc[key] = values[key];
                }
                return acc;
            }, {} as Partial<Item>);
            // @ts-ignore
            updatedFields["_id"] = record["_id"];
            handleSave({...updatedFields});
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{margin: 0}}
                name={dataIndex}
            >
                {inputType === "select" ? (
                    <Select
                        ref={inputRef as React.Ref<BaseSelectRef>}
                        onBlur={save}
                        onChange={save}
                        mode="multiple"
                    >
                        {options.map(option => (
                            <Option key={option} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                ) : (
                    <Input ref={inputRef as React.Ref<InputRef>} onPressEnter={save} onBlur={save}/>
                )}
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" style={{paddingRight: 24}} onClick={toggleEdit}>
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
