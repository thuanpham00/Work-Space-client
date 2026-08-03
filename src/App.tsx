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
