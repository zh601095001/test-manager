// LoadingOverlay.tsx
import React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '@/store';
import {Spin} from 'antd';

const LoadingOverlay: React.FC = () => {
    const isLoading = useSelector((state: RootState) => state.loading.isLoading);

    return (
        <>
            {isLoading && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 1000000, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <Spin size="large"/><span style={{marginLeft: 15}}>加载中...</span>
                </div>
            )}
        </>
    );
};

export default LoadingOverlay;
