import {fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {RootState} from "@/store";
import {clearCredentials, setCredentials} from "@/features/auth/authSlice";
import {message} from "antd";

const baseQuery = fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

// @ts-ignore
export const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (args.url === "login") {
        return result
    }
    // @ts-ignore
    if (result.error && result.error.originalStatus === 401) {
        const refreshResult = await baseQuery({url: 'refresh-token', method: 'POST'}, api, extraOptions);
        if (refreshResult.data) {
            const user = api.getState().auth.user;
            api.dispatch(setCredentials({
                ...user,
                // @ts-ignore
                accessToken: refreshResult.data.accessToken,
            }));
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(clearCredentials())
            window.location.href = '/login';
        }
    } else if (result.error && result.error.status !== 401) {
        message.error(`Error: ${result.error.data || 'An error occurred'}`);
    }


    return result;
};