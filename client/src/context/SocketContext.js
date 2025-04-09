import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the socket server
    const socketInstance = io('http://localhost:5000', {
      withCredentials: true
    });

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    // Save the socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join a ticket room
  const joinTicket = (ticketId) => {
    if (socket && isConnected) {
      socket.emit('joinTicket', ticketId);
    }
  };

  // Leave a ticket room
  const leaveTicket = (ticketId) => {
    if (socket && isConnected) {
      socket.emit('leaveTicket', ticketId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinTicket, leaveTicket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
