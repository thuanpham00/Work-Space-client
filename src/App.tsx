import { useEffect } from "react";
import AppProvider from "./providers/AppProvider";
import useRouter from "./routes/useRouter";
import { generateSocket } from "./utils/utils";
import { useUserStore } from "./store/userStore";
import { useBaseStore } from "./store/baseStore";
import { socketApi } from "./apis/socket.api";
import { useChannelStore } from "./store/channelStore";
import { clearLS } from "./utils/auth";
import { useNavigate } from "react-router-dom";
import { httpRaw } from "./utils/http";

const App = () => {
  const router = useRouter();
  const accessToken = useUserStore((app) => app.accessToken);
  const setAccessToken = useUserStore((app) => app.setAccessToken);

  const resetBaseStore = useBaseStore((state) => state.reset);
  const resetUserStore = useUserStore((state) => state.reset);
  const resetChannelStore = useChannelStore((state) => state.reset);

  const socket = useBaseStore((app) => app.socket);
  const setSocket = useBaseStore((app) => app.setSocket);

  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken || socket) return;

    const newSocket = generateSocket(accessToken);
    setSocket(newSocket);
  }, [accessToken, socket]);

  useEffect(() => {
    if (!socket || !accessToken) return;

    socket.auth = {
      ...socket.auth,
      Authorization: `Bearer ${accessToken}`,
    };

    if (!socket.connected) {
      socket.connect(); // chủ động kết nối
    }

    return () => {
      socket.disconnect();
    };
  }, [socket, accessToken]);

  // xử lý 2 sự kiện refreshToken và error (do refreshToken hết hạn)
  useEffect(() => {
    if (!socket) return;

    const handleTokenRefresh = async (payload: { accessToken: string; refreshToken: string }) => {
      setAccessToken(payload.accessToken);
      console.log("payload", payload);

      socket.auth = {
        ...socket.auth,
        Authorization: `Bearer ${payload.accessToken}`,
      };
      httpRaw.setToken(payload.accessToken);
      // đồng bộ RT cookie thông qua http vì socketIo ko set cookie được
      await socketApi.syncRefreshToken(payload.refreshToken);

      socket.disconnect();
      socket.connect();
    };

    const handleAuthError = (payload: { message: string; code?: number; type?: string }) => {
      // RT hết hạn/không hợp lệ → logout
      if (payload.type === "refresh_token_expired") {
        clearLS();
        resetBaseStore();
        resetUserStore();
        resetChannelStore();
        navigate("/auth/login");
      }
    };

    socket.on("token_refresh", handleTokenRefresh);
    socket.on("auth_error", handleAuthError);

    return () => {
      socket.off("token_refresh", handleTokenRefresh);
      socket.off("auth_error", handleAuthError);
    };
  }, [socket, setAccessToken, clearLS, resetBaseStore, resetUserStore, resetChannelStore, navigate]);

  return <AppProvider>{router}</AppProvider>;
};

export default App;
