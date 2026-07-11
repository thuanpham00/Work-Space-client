const { VITE_URL_API_SERVER } = import.meta.env;
export const config = {
  baseURLServer: VITE_URL_API_SERVER,
  maxSizeUploadImage: 5242880, // 1mb
};
