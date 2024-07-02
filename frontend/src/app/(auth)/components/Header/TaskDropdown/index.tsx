import React, {useState} from 'react';
import styles from "@/app/(auth)/index.module.scss";
import {Dropdown, Empty, type MenuProps} from "antd";
import {useGetTasksMutation} from "@/services/task";
import TaskDropdownItem from "@/app/(auth)/components/Header/TaskDropdown/TaskDropdownItem";
import TaskDetailModal from "@/app/(auth)/components/Header/TaskDropdown/TaskDropdownItem/TaskDetailModal";

function TaskDropdown() {
    const [taskItems, setTaskItems] = useState<MenuProps['items']>([])
    const [getTasks] = useGetTasksMutation()
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const handleTaskMenuClick = async () => {
        const tasks = await getTasks({
            title: "(switchFirmware|批量更新)",
            limit: 100
        }).unwrap()
        const taskItems = tasks.map((task: any) => {
            const {createdAt} = task
            const createdAtDate = new Date(createdAt)
            const currentTime = new Date();
            const timeDiff = currentTime.getTime() - createdAtDate.getTime();
            const raw_seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            // @ts-ignore
            let iconSvg = {
                "pending": "pending.svg",
                "running": "running.svg",
                "failed": "failed.svg",
                "completed": "finished.svg"
            }[task.status]
            if (raw_seconds < 0) {
                iconSvg = "pending.svg"
            }
            return {
                key: task._id,
                label: <TaskDropdownItem task={task}/>,
                icon: <img src={iconSvg} width={20} alt=""/>,
            }
        })
        setTaskItems(taskItems)
    }

    return (
        <>
            <Dropdown
                overlayClassName={styles.taskItemList}
                menu={{items: taskItems, onClick: () => setIsModalOpen(true)}}
                trigger={["click"]}
                placement="bottomCenter"
                overlayStyle={{width: 300}}
                dropdownRender={(originNode) => {
                    // @ts-ignore
                    if (!originNode?.props?.items?.length) {
                        return <div style={{
                            height: 450,
                            background: "white",
                            boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.08),0 3px 6px -4px rgba(0, 0, 0, 0.12),0 9px 28px 8px rgba(0, 0, 0, 0.05)",
                            borderRadius: 8,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无任务"/></div>
                    }
                    return originNode
                }}
            >
                <div
                    style={{display: "flex", alignItems: "center"}}
                    onClick={handleTaskMenuClick}
                >
                    <img src="task.svg" alt="" width={30}/>
                    <span style={{marginRight: 40}}>任务</span>
                </div>
            </Dropdown>
            <TaskDetailModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}/>
        </>

    );
}

export default TaskDropdown;