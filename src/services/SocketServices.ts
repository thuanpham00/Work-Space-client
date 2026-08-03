import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../utils/config";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;
    this.socket = io(SOCKET_URL, { auth: { token } });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, payload: any) {
    this.socket?.emit(event, payload);
  }

  on(event: string, handler: (payload: any) => void) {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: (payload: any) => void) {
    this.socket?.off(event, handler);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
