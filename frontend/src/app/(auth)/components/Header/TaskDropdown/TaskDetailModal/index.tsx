"use client"
import React, {useEffect, useState} from 'react';
import {Button, Modal} from "antd";
import dynamic from "next/dynamic";
import {useGetTaskByIdMutation} from "@/services/task";

const DynamicTerminalComponent = dynamic(() => import('@/components/Terminal'), {
    ssr: false,
});

function TaskDetailModal({isModalOpen, setIsModalOpen, taskId}: {
    isModalOpen: boolean,
    setIsModalOpen: (isModalOpen: boolean) => void,
    taskId: string
}) {
    const [input, setInput] = useState("");
    const [getTaskById] = useGetTaskByIdMutation()
    const [prevStdoutLength, setPrevStdoutLength] = useState(0)
    const [prevStderrLength, setPrevStderrLength] = useState(0)
    const [status, setStatus] = useState<string>("");
    const [taskTitle,setTaskTitle] = useState<string>("");
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isModalOpen) {
            intervalId = setInterval(async () => {
                const task = await getTaskById({_id: taskId}).unwrap();
                setTaskTitle(task.title);
                const {stdout, stderr} = task;
                let newInput = "";
                if (stdout && stdout.length > prevStdoutLength) {
                    const newOutput = stdout.slice(prevStdoutLength).join('\r\n') + '\r\n';
                    newInput += newOutput;
                    setPrevStdoutLength(stdout.length);
                }
                if (stderr && stderr.length > prevStderrLength) {
                    const newOutput = stderr.slice(prevStderrLength).join('\r\n') + '\r\n';
                    newInput += newOutput;
                    setPrevStderrLength(stderr.length);
                }

                if (newInput) {
                    setInput((prevInput) => prevInput + newInput);
                }
                setStatus(task.status);
            }, 1000); // 每秒调用一次 API
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isModalOpen, taskId, prevStdoutLength, prevStderrLength, getTaskById]);
    let iconSvg = {
        "pending": "pending.svg",
        "running": "running.svg",
        "failed": "failed.svg",
        "completed": "finished.svg"
    }[status]
    return (
        <Modal
            destroyOnClose={true}
            width={"60%"}
            title={(
                <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}>
                    <span style={{marginRight: 10}}>任务{taskTitle}详情</span>
                    {
                        iconSvg ? (
                            <span style={{display: "flex", alignItems: "center", color: "#bcbbbb"}}>
                                <img style={{marginRight: 5}} src={iconSvg} width={16} alt=""/>
                                {status}
                            </span>
                        ) : ""
                    }
                </div>
            )}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={<Button type="primary" onClick={() => setIsModalOpen(false)}>确认</Button>}
        >
            <DynamicTerminalComponent input={input}/>
        </Modal>
    );
}

export default TaskDetailModal;