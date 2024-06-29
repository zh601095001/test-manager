import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import {RootState} from '@/store'
import {clearCredentials, setCredentials} from "@/features/auth/authSlice";
import {baseQueryWithReauth} from "@/lib/baseQuery";

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

// 创建API服务
export const authApi = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        login: builder.mutation<UserResponse, LoginRequest>({
            query: (credentials) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
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
        })
    }),
})

// 导出用于登录的mutation钩子
export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useRefreshTokenMutation
} = authApi;
