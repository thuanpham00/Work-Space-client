/* eslint-disable react-hooks/immutability */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useBaseStore } from "../store/baseStore";
import { useUserStore } from "../store/userStore";
import { useChannelStore } from "../store/channelStore";
import { socketApi } from "../apis/socket.api";
import { httpRaw } from "../utils/http";
import { useSocketEvent } from "./useSocketEvent";
import { SOCKET_EMIT_EVENT, SOCKET_LISTEN_EVENT } from "./events";
import type { AuthErrorPayload, TokenRefreshPayload } from "./events";

/**
 * Nhóm auth / vòng đời — logic tách nguyên từ `App.tsx`, giữ nguyên hành vi.
 * Được mount qua `useGlobalSocket` ở `MainLayout`.
 * - heartbeat 30s giữ online (Redis EXPIRE)
 * - `token_refresh`: đổi accessToken + reconnect socket
 * - `auth_error`: RT hết hạn → logout về /login
 */
export function useAuthSocket() {
  const socket = useBaseStore((state) => state.socket);
  const accessToken = useUserStore((state) => state.accessToken);
  const setAccessToken = useUserStore((state) => state.setAccessToken);
  const resetBaseStore = useBaseStore((state) => state.reset);
  const resetUserStore = useUserStore((state) => state.reset);
  const resetChannelStore = useChannelStore((state) => state.reset);
  const navigate = useNavigate();

  // heartbeat — giữ nguyên y hệt App.tsx
  useEffect(() => {
    if (!socket || !accessToken) return;

    socket.auth = {
      ...socket.auth,
      Authorization: `Bearer ${accessToken}`,
    };

    if (!socket.connected) {
      socket.connect();
    }

    const heartbeatInterval = setInterval(() => {
      socket.emit(SOCKET_EMIT_EVENT.HEARTBEAT);
    }, 30_000);

    return () => {
      clearInterval(heartbeatInterval);
      socket.disconnect();
    };
  }, [socket, accessToken]);

  useSocketEvent(SOCKET_LISTEN_EVENT.TOKEN_REFRESH, async (payload: TokenRefreshPayload) => {
    setAccessToken(payload.accessToken);

    const current = useBaseStore.getState().socket;
    if (current) {
      current.auth = {
        ...current.auth,
        Authorization: `Bearer ${payload.accessToken}`,
      };
    }
    httpRaw.setToken(payload.accessToken);
    // đồng bộ RT cookie thông qua http vì socketIo ko set cookie được
    await socketApi.syncRefreshToken(payload.refreshToken);

    current?.disconnect();
    current?.connect();
  });

  useSocketEvent(SOCKET_LISTEN_EVENT.AUTH_ERROR, async (payload: AuthErrorPayload) => {
    // RT hết hạn/không hợp lệ → logout
    if (payload.type === "refresh_token_expired") {
      resetBaseStore();
      resetUserStore();
      resetChannelStore();

      // đồng bộ RT khỏi DB
      await socketApi.syncRemoveRefreshToken(payload.refreshToken as string);
      message.error("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại");
      navigate("/login");
    }
  });
}
