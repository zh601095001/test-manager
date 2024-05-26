"use client"
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '@/store';

type AuthState = {
    message: string | null;
    accessToken: string | null;
    username: string | null;
    roles: string[] | null;
};

export const loadInitialState = (): AuthState => {
    return {
        message: null,
        accessToken: localStorage.getItem('accessToken'),
        username: localStorage.getItem('username'),
        roles: JSON.parse(localStorage.getItem('roles') || 'null'),
    };
};

const initialState: AuthState = {
    message: null,
    accessToken: null,
    username: null,
    roles: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setCredentials: (
            state,
            {payload: {username, accessToken, roles}}: PayloadAction<{
                username: string | null;
                accessToken: string | null;
                roles: string[] | null
            }>
        ) => {
            state.username = username;
            state.roles = roles;
            state.accessToken = accessToken;
            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', accessToken || '');
                localStorage.setItem('username', username || '');
                localStorage.setItem('roles', JSON.stringify(roles));
            }
        },
        clearCredentials: (state) => {
            state.username = null;
            state.accessToken = null;
            state.roles = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('username');
                localStorage.removeItem('roles');
            }
        },
    },
});

export const {setCredentials, clearCredentials} = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.username;
export const selectCurrentRoles = (state: RootState) => state.auth.roles;
