import { useEffect, useState } from 'react';
import { getSocket } from './useSocket';
import { NotificationPayload } from '../types/types';

export interface NotificationItem extends NotificationPayload {
  id: string; // unique identifier for each notification
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (payload: NotificationPayload) => {
      const newNotification: NotificationItem = { ...payload, id: generateId() };
      setNotifications(prev => [...prev, newNotification]);

      // Remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, []);

  return { notifications };
};

export default useNotifications;
