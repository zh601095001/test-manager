import {createApi} from '@reduxjs/toolkit/query/react'
import {baseQueryWithReauth} from "@/lib/baseQuery";

// 任务创建请求的接口
interface CreateTaskRequest {
    title: string;
    description?: string;
    taskType: 'ssh' | 'python' | 'sql' | 'bash';
    script: string;
    environment?: Record<string, string | number>;
    executionPath?: string;
    runtimeEnv?: Record<string, string>;
    templateVariables?: Record<string, string>;
    username?: string;
    callbackName?: string;
}

// 响应数据的接口
// 完整的任务响应数据的接口
interface CreateTaskResponse {
    _id: string;
    title: string;
    description?: string;
    taskType: 'ssh' | 'python' | 'sql' | 'bash';
    script: string;
    environment?: Record<string, string | number>;
    executionPath?: string;
    runtimeEnv?: Record<string, string>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: string;
    username?: string;
    stdout?: string[];
    stderr?: string[];
    callbackName?: string;
    exitCode?: number;
    exitSignal?: string;
    error?: string;
    info?: Record<string, string>;
    templateVariables?: Record<string, string>;
}


export const taskApi = createApi({
    reducerPath: 'taskApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        createConcurrentTask: builder.mutation<CreateTaskResponse, CreateTaskRequest>({
            query: (taskData) => ({
                url: 'tasks/create',
                method: 'POST',
                body: taskData
            })
        })
    }),
});

export const {
    useCreateConcurrentTaskMutation
} = taskApi