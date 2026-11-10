import { useEffect, useRef } from "react";
import { useBaseStore } from "../store/baseStore";
import type { ServerToClientEvents, SocketListenEventName } from "./events";

type Handler<E extends SocketListenEventName> = (payload: ServerToClientEvents[E]) => void;

/**
 * Đăng ký 1 socket event tập trung, thay cho `socket.on/off` rải rác.
 *
 * - Tên event + kiểu payload lấy từ `src/socket/events.ts` → sai tên là typecheck báo ngay.
 * - Handler giữ trong ref (giống pattern `onMessageRef` trong `useChannelSocket`)
 *   nên component re-render không gây re-bind / leave-join lại.
 * - `enabled` dùng để chờ điều kiện như `!!accessToken` trước khi subscribe.
 */
export function useSocketEvent<E extends SocketListenEventName>(
  event: E,
  handler: Handler<E>,
  enabled = true,
) {
  const socket = useBaseStore((state) => state.socket);

  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket || !enabled) return;

    const wrapped = (payload: ServerToClientEvents[E]) => handlerRef.current(payload);
    socket.on(event, wrapped as never);

    return () => {
      socket.off(event, wrapped as never);
    };
  }, [socket, event, enabled]);
}
