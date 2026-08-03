import { useEffect } from "react";
import AppProvider from "./providers/AppProvider";
import useRouter from "./routes/useRouter";
import { useAppStore } from "./store/store";
import { generateSocket } from "./utils/utils";

const App = () => {
  const router = useRouter();
  const accessToken = useAppStore((app) => app.accessToken);
  const socket = useAppStore((app) => app.socket);
  const setSocket = useAppStore((app) => app.setSocket);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("✅ Đã kết nối Socket với server! ID của tôi:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    if (accessToken && !socket) {
      setSocket(generateSocket(accessToken));
    }
  }, [accessToken]);

  return <AppProvider>{router}</AppProvider>;
};

export default App;
