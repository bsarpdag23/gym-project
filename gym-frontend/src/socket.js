import { io } from 'socket.io-client';
import { API_URL } from './api';

let socket = null;

// Soket bağlantısını tembel şekilde kurar (ilk çağrıda), token değiştiyse yeniden bağlanır
export function getSocket() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (!socket) {
    socket = io(API_URL, { auth: { token }, transports: ['websocket', 'polling'] });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
