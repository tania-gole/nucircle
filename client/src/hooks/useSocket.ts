/* eslint-disable no-console */
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// const SOCKET_URL = window.location.origin;

let socket: Socket | null = null;

/**
 * Custom hook to manage Socket.IO connection for real-time communication.
 * Automatically connects when user logs in and disconnects when user logs out.
 *
 * @param username - The logged-in user's username
 * @returns The socket instance for manual event listening if needed
 */
export const useSocket = (username: string | null): void => {
  const socketRef = useRef<Socket | null>(null);

  // useEffect(() => {
  //   // If there is no username, disconnect the socket
  //   if (!username) {
  //     if (socketRef.current) {
  //       socketRef.current.disconnect();
  //       socketRef.current = null;
  //       socket = null;
  //     }
  //     return;
  //   }

  //   // Will connect the user if they are not already connected
  //   if (!socketRef.current || !socketRef.current.connected) {
  //     socket = io(SOCKET_URL, {
  //       path: '/socket.io',
  //       transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
  //     });

  //     socketRef.current = socket;

  //     socket.on('connect', () => {
  //       socket?.emit('userConnect', username);
  //     });

  //     socket.on('connect_error', error => {
  //       throw new Error(`Socket connection failed: ${error.message}`);
  //     });
  //   }

  //   // Cleanup: disconnect when component unmounts or username changes
  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.disconnect();
  //       socketRef.current = null;
  //       socket = null;
  //     }
  //   };
  // }, [username]); // Re-run when username changes
  useEffect(() => {
    console.log('[useSocket] Effect running, username:', username);

    // Disconnect if no username
    if (!username) {
      console.log('[useSocket] No username, disconnecting');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socket = null;
      }
      return;
    }

    // Connect if not connected
    if (!socketRef.current || !socketRef.current.connected) {
      console.log('[useSocket] Creating new socket connection for:', username);
      socket = io(window.location.origin, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[useSocket] Socket connected:', socket?.id);
        console.log('[useSocket] Emitting userConnect for:', username);
        socket?.emit('userConnect', username);
      });

      socket.on('connect_error', error => {
        console.error('[useSocket] Socket connection error:', error);
      });
    }

    // Cleanup on unmount
    return () => {
      console.log('[useSocket] Cleanup for:', username);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socket = null;
      }
    };
  }, [username]);
};

/**
 * Get the global socket instance.
 * Useful for components that need to listen to socket events without managing connection.
 *
 * @returns The current socket instance or null if not connected
 */
export const getSocket = (): Socket | null => {
  return socket;
};
