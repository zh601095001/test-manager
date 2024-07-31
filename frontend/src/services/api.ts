import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQueryWithReauth} from "@/lib/baseQuery";
import {clearCredentials, setCredentials} from "@/features/auth/authSlice";

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
    nickName?: string
}

export interface UserResponse {
    message: string;
    accessToken: string;
    username: string;
    roles: string[];
    email: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
}

interface RefreshTokenResponse {
    message: string;
    accessToken: string;
    username: string;
    roles: string[];
    email: string;
}

export const api = createApi({
    reducerPath: 'usersApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Users', "Avatar", "User", "Device-filters"],
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
        getAvatars: builder.query<{ username: string, avatarUrl: string, nickName: string }[], void>({
            query: () => ({
                url: '/avatars',
                method: 'GET',
            }),
            transformResponse: (response: { avatars: { username: string, avatar: string, nickName: string }[] }) => {
                return response.avatars.map(avatar => ({
                    username: avatar.username,
                    avatarUrl: avatar.avatar,
                    nickName: avatar.nickName
                }));
            },
            providesTags: ['Avatar'],
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
        }),
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
            invalidatesTags: ['User', "Avatar"],
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

        login: builder.mutation<UserResponse, LoginRequest>({
            query: (credentials) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
            onQueryStarted: async (arg, {dispatch, queryFulfilled}) => {
                try {
                    const {data: {username, accessToken, roles, email}} = await queryFulfilled;
                    dispatch(setCredentials({username, accessToken, roles, email}));
                } catch (err) {
                    // 可以在这里处理登录失败的情况
                    console.error('Login failed:', err);
                }
            },
            invalidatesTags: ['User'],
        }),
        // 添加注册mutation
        register: builder.mutation<UserResponse, RegisterRequest>({
            query: (credentials) => ({
                url: 'register',
                method: 'POST',
                body: credentials,
            }),
        }),
        logout: builder.mutation({
            query: () => {

                return {
                    url: 'logout',
                    method: 'POST',
                }
            },
            onQueryStarted: async (arg, {dispatch, queryFulfilled}) => {
                try {
                    await queryFulfilled;
                    dispatch(clearCredentials());  // 清除登录信息
                } catch (error) {
                    dispatch(clearCredentials());  // 清除登录信息
                }
            }
        }),
        deleteAccount: builder.mutation<UserResponse, RegisterRequest>({
            query: () => ({
                url: 'user',
                method: 'DELETE',
            }),
        }),
        refreshToken: builder.mutation<RefreshTokenResponse, void>({
            query: () => ({
                url: "refresh-token",
                method: "POST"
            })
        }),
        getDeviceFilters: builder.query<string[], void>({
            query: () => ({
                url: '/user/device-filters',
                method: 'GET',
            }),
            transformResponse: (response: { deviceFilters: string[] }) => {
                return response.deviceFilters
            },
            providesTags: ['Device-filters'],
        }),
        setDeviceFilters: builder.mutation<{ message: string }, { deviceFilters: string[] }>({
            query: (payload) => ({
                url: "/user/device-filters",
                method: "PUT",
                body: payload
            }),
            invalidatesTags: ['Device-filters'],
        }),
        setNickName: builder.mutation<{ message: string }, { nickName: string }>({
            query: (payload) => ({
                url: "/user/nickname",
                method: "POST",
                body: payload
            }),
            invalidatesTags: ['User', "Avatar"],
        }),
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
    useResetPasswordMutation,
    useUserQuery,
    useUpdateEmailMutation,
    useUpdateAvatarMutation,
    useChangePasswordMutation,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
    useGetAvatarsQuery,
    useGetDeviceFiltersQuery,
    useSetDeviceFiltersMutation,
    useSetNickNameMutation
} = api;
