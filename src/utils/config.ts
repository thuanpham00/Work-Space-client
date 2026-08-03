const { VITE_URL_API_SERVER } = import.meta.env;
export const config = {
  baseURLServer: VITE_URL_API_SERVER,
  maxSizeUploadImage: 5242880, // 1mb
};

export const SOCKET_URL = import.meta.env.VITE_URL_API_SERVER;

export const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
