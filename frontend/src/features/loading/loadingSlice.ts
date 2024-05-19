// features/loadingSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface LoadingState {
    isVisible: boolean;
}

const initialState: LoadingState = {
    isVisible: false,
};

export const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        showLoading: (state) => {
            state.isVisible = true;
        },
        hideLoading: (state) => {
            state.isVisible = false;
        },
    },
});

export const { showLoading, hideLoading } = loadingSlice.actions;
export const isLoadingVisibleSelector = (state: any) => state.loading.isVisible
export default loadingSlice.reducer;
