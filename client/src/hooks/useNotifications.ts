import { useEffect, useState, useCallback } from 'react';
import { getSocket } from './useSocket';
import { NotificationPayload } from '../types/types';

// for when multiple notifications
export interface NotificationItem extends NotificationPayload {
  id: string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

// Hook to manage notifications
const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [socketReady, setSocketReady] = useState(false);

  // Poll for socket availability since it may not exist on first mount
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      setSocketReady(true);
      return;
    }

    const interval = setInterval(() => {
      const s = getSocket();
      if (s) {
        setSocketReady(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleNotification = useCallback((payload: NotificationPayload) => {
    const newNotification: NotificationItem = { ...payload, id: generateId() };
    setNotifications(prev => [...prev, newNotification]);

    // remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (!socketReady) return;
    const socket = getSocket();
    if (!socket) return;

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socketReady, handleNotification]);

  return { notifications };
};

export default useNotifications;
