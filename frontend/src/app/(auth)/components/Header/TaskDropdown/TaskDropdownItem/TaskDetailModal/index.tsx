import React from 'react';
import {Button, Modal} from "antd";

function TaskDetailModal({isModalOpen, setIsModalOpen}: {
    isModalOpen: boolean,
    setIsModalOpen: (isModalOpen: boolean) => void
}) {
    const handleOk = () => {

    }
    return (
        <Modal
            title="任务详情"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={<Button type="primary" onClick={() => setIsModalOpen(false)}>确认</Button>}
        >
            asasaasf
        </Modal>
    );
}

export default TaskDetailModal;