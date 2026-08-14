import { useEffect } from "react";
import AppProvider from "./providers/AppProvider";
import useRouter from "./routes/useRouter";
import { generateSocket } from "./utils/utils";
import { useUserStore } from "./store/userStore";
import { useBaseStore } from "./store/baseStore";

const App = () => {
  const router = useRouter();
  const accessToken = useUserStore((app) => app.accessToken);
  const socket = useBaseStore((app) => app.socket);
  const setSocket = useBaseStore((app) => app.setSocket);
  const setIsSocketConnected = useBaseStore((app) => app.setIsSocketConnected);

  useEffect(() => {
    if (!accessToken || socket) return;

    const newSocket = generateSocket(accessToken);
    setSocket(newSocket);
  }, [accessToken, socket]);

  useEffect(() => {
    if (!socket || !accessToken) return;

    const handleConnect = () => {
      setIsSocketConnected(true);
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    socket.on("connect", handleConnect); // sự kiện mặc định của socket khi client kết nối tới server thành công
    socket.on("disconnect", handleDisconnect);

    socket.auth = {
      ...socket.auth,
      Authorization: `Bearer ${accessToken}`,
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect(); // chủ động kết nối
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, accessToken]);

  return <AppProvider>{router}</AppProvider>;
};

export default App;
