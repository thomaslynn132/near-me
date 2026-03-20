import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io('/', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  sendMessage(matchId: string, content: string, messageType = 'text', mediaUrl?: string) {
    this.emit('send_message', { matchId, content, messageType, mediaUrl });
  }

  joinMatch(matchId: string) {
    this.emit('join_match', { matchId });
  }

  leaveMatch(matchId: string) {
    this.emit('leave_match', { matchId });
  }

  startTyping(matchId: string) {
    this.emit('typing_start', { matchId });
  }

  stopTyping(matchId: string) {
    this.emit('typing_stop', { matchId });
  }

  markRead(matchId: string) {
    this.emit('mark_read', { matchId });
  }

  updateLocation(coordinates: [number, number]) {
    this.emit('location_update', { coordinates });
  }
}

export const socketService = new SocketService();
