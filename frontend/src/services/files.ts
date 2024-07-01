import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from "@/lib/baseQuery";


interface GetFileUrlArgs {
    bucketName: string;
    objectName: string;
}
interface FileUrlResponse {
    url: string;
}

export const filesApi = createApi({
    reducerPath: 'filesApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['File'],
    endpoints: (builder) => ({
        getFileUrl: builder.mutation<FileUrlResponse, GetFileUrlArgs>({
            query: ({ bucketName, objectName }) => ({
                url: `/files/url/${bucketName}/${objectName}`,
                method: 'GET'
            }),
        }),
    }),
});

// 导出钩子
export const {
    useGetFileUrlMutation, // Mutation 钩子
} = filesApi;
