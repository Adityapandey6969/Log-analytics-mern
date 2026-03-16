import io from 'socket.io-client';
import { SOCKET_URL } from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }
  
  connect() {
    if (this.socket?.connected) return;
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false
    });
    
    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
    
    // Store for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
  
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();
