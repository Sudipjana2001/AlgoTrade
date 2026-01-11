import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { websocketService } from '@/services/websocket';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'BUY' | 'SELL' | 'HOLD' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Listen for WebSocket Signal Updates
    const unsubscribe = websocketService.on('SIGNAL_UPDATE', (payload: any) => {
      const data = payload.data;
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: data.type === 'BUY' ? 'BUY' : data.type === 'SELL' ? 'SELL' : 'info',
        title: `New ${data.type} Signal: ${data.symbol}`,
        message: `${data.symbol} triggered at ₹${data.price} with ${data.confidence}% confidence.`,
        timestamp: new Date(),
        read: false,
      };

      // Add to state
      setNotifications((prev) => [newNotification, ...prev]);

      // Show Toast
      toast(newNotification.title, {
        description: newNotification.message,
        action: {
          label: 'View',
          onClick: () => console.log('Navigate to signal'),
        },
      });

      // Browser Notification (if supported & allowed)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico', // Update with actual icon path if available
        });
      }
    });

    // Request Browser Notification Permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
