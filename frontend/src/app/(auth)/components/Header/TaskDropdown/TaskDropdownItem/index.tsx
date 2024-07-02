import React, {useState} from 'react';
import TaskDetailModal from "@/app/(auth)/components/Header/TaskDropdown/TaskDetailModal";

function TaskDropdownItem({task}: { task: any }) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const {createdAt} = task
    const createdAtDate = new Date(createdAt)
    const createdAtDateStr = createdAtDate.toLocaleString("zh-CN", {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
        timeZone: "Asia/Shanghai" // 设置时区为 GMT+8
    });
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - createdAtDate.getTime();
    const hours = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = Math.max(0, Math.floor((timeDiff % (1000 * 60)) / 1000));
    return (
        <>
            <div onClick={() => setIsModalOpen(true)}>
                <div style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "80%"
                }}
                >
                    {task.title}
                </div>
                <div style={{fontSize: 10, color: "#d8d8d8"}}>
                    <span>创建于:{createdAtDateStr}</span>
                    <span style={{marginLeft: 10}}>
                    用时:{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                </span>
                </div>
            </div>
            <TaskDetailModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} taskId={task._id}/>
        </>

    );
}

export default TaskDropdownItem;