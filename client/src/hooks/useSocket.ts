import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let socket: Socket | null = null;

export const useSocket = (username: string | null): void => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Disconnect if no username
    if (!username) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socket = null;
      }
      return;
    }

    // Reuse existing global socket if possible
    if (socket && socket.connected) {
      socketRef.current = socket;
    } else if (!socketRef.current || !socketRef.current.connected) {
      // Include auth token for Socket.IO authentication
      const token = localStorage.getItem('authToken');
      socket = io(socketUrl, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
        auth: {
          token,
        },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket?.emit('userConnect', username);
      });

      socket.on('connect_error', () => {
        // Connection error handled by socket.io reconnection
      });

      socket.on('disconnect', () => {
        // Disconnection handled by socket.io reconnection
      });
    }

    // Cleanup on unmount or username change
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socket = null;
      }
    };
  }, [username]);
};

export const getSocket = (): Socket | null => {
  return socket;
};
