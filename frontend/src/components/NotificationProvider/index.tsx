import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
    id: number;
    message: string;
    isError: boolean;
}

interface NotificationContextType {
    showNotification: (message: string, isError: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    function showNotification(message: string, isError: boolean): void {
        const newNotification: Notification = { id: Date.now(), message, isError };
        setNotifications(prevNotifications => [...prevNotifications, newNotification]);
        setTimeout(() => {
            setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== newNotification.id));
        }, 8000);
    }

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            <div id="notification-container">
                {notifications.map((notification) => (
                    <div key={notification.id} style={{
                        backgroundColor: notification.isError ? '#f8d7da' : '#d4edda',
                        color: notification.isError ? '#721c24' : '#155724',
                        border: notification.isError ? '1px solid #f5c6cb' : '1px solid #c3e6cb',
                        borderRadius: '5px',
                        padding: '10px',
                        marginTop: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                        {notification.message}
                    </div>
                ))}
            </div>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications(): NotificationContextType {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
