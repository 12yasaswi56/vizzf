import { io } from 'socket.io-client';

// Create a socket instance
const socket = io('https://back-nipj.onrender.com', {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"]
});

// Socket event listeners for debugging
socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from socket server');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Connect to the socket server
socket.connect();

// Export the socket instance
export default socket;