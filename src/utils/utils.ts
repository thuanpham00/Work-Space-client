import { io } from "socket.io-client";

export const generateSocket = (accessToken: string) => {
  return io(import.meta.env.VITE_URL_API_SERVER, {
    auth: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
