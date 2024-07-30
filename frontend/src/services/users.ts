import {createApi} from '@reduxjs/toolkit/query/react';
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
    password?: string; // 添加可选的密码字段
}

export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => ({
                url: '/admin/users',
                method: 'GET',
            }),
            transformResponse: (response: User[]) =>
                response.map(user => ({...user, password: ""})), // 为每个用户添加空的密码字段
            providesTags: ['Users'],
        }),
        updateEmailByAdmin: builder.mutation<any, {
            email: string,
            _id: string
        }>({
            query: (payload) => ({
                url: '/admin/user/update-email',
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: ["Users"]
        }),
        updateRolesByAdmin: builder.mutation<any, {
            roles: string[],
            _id: string
        }>({
            query: (payload) => ({
                url: '/admin/user/update-roles',
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: ["Users"]
        }),
        updatePasswordByAdmin: builder.mutation<any, {
            newPassword: string,
            _id: string
        }>({
            query: (payload) => ({
                url: '/admin/user/update-password',
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: ["Users"]
        }),
        deleteUserByAdmin: builder.mutation<any, {
            _id: string
        }>({
            query: ({_id}) => ({
                url: `/admin/user/${_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["Users"]
        }),
        sendForgetPasswordEmail: builder.mutation<any, {
            email: string,
        }>({
            query: ({email}) => ({
                url: `/user/send-reset-password-email`,
                method: 'POST',
                body: {
                    email,
                    frontendUrl: window.location.origin
                }
            }),
        }),
        resetPassword: builder.mutation<any, {
            token: string,
            newPassword: string
        }>({
            query: ({token, newPassword}) => ({
                url: `/user/reset-password`,
                method: 'POST',
                body: {
                    token,
                    newPassword
                }
            }),
        })
    }),
});

// 导出钩子
export const {
    useGetUsersQuery,
    useUpdateEmailByAdminMutation,
    useUpdateRolesByAdminMutation,
    useUpdatePasswordByAdminMutation,
    useDeleteUserByAdminMutation,
    useSendForgetPasswordEmailMutation,
    useResetPasswordMutation
} = usersApi;
