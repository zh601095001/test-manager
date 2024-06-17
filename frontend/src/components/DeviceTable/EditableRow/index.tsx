import React from "react";
import {Form} from "antd";
import {EditableContext} from "../context";

interface EditableRowProps {
    index: number;
}

export const EditableRow: React.FC<EditableRowProps> = ({index, ...props}) => {
    const [form] = Form.useForm();
    let statusColor
    // @ts-ignore
    if (props.children && props.children.length > 7) {
        // @ts-ignore
        const status = props.children[7].props.record.status
        // @ts-ignore
        statusColor = {
            "unlocked": undefined,
            "locked": "#f8d7da",
            "maintained": "#fffa8e",
            "automated": "#e0e8f6"
        }[status]
        // @ts-ignore
        if (props.children[7].props.record.comment === "自动化测试") {
            statusColor = "#e0e8f6"
        }
    }

    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} style={{background: statusColor}}/>
            </EditableContext.Provider>
        </Form>
    );
};

export default EditableRow