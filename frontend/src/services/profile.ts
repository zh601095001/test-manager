import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import {baseQueryWithReauth} from "@/lib/baseQuery";

// 定义用户信息接口
interface User {
    username: string;
    email: string;
    roles: string[];
    avatar?: string;
    settings?: {
        deviceFilters?: any[];
    };
}

// 创建API服务
export const profileApi = createApi({
    reducerPath: 'profileApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User'],
    endpoints: (builder) => ({
        user: builder.query<User, void>({
            query: () => ({
                url: '/user',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),
        updateEmail: builder.mutation<{
            message: string
        }, {
            email: string
        }>({
            query: (credentials) => ({
                url: '/user/update-email',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        updateAvatar: builder.mutation<{
            message: string
        }, {
            avatar: string
        }>({
            query: (credentials) => ({
                url: '/user/update-avatar',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        changePassword: builder.mutation<{
            message: string
        }, {
            oldPassword: string,
            newPassword: string
        }>({
            query: (credentials) => ({
                url: '/user/change-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
    }),
})


export const {
    useUserQuery,
    useUpdateEmailMutation,
    useUpdateAvatarMutation,
    useChangePasswordMutation
} = profileApi;
