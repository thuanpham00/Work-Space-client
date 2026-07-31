import { io } from "socket.io-client";
import dayjs from "dayjs";

export const generateSocket = (accessToken: string) => {
  return io(import.meta.env.VITE_URL_API_SERVER, {
    auth: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const formatMessageTime = (dateString: string | number | Date) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const isYesterday =
    new Date(now.getTime() - 86400000).getDate() === date.getDate() &&
    new Date(now.getTime() - 86400000).getMonth() === date.getMonth() &&
    new Date(now.getTime() - 86400000).getFullYear() === date.getFullYear();

  const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  const timeString = date.toLocaleTimeString(undefined, timeOptions);

  if (isToday) {
    return `Today at ${timeString}`;
  } else if (isYesterday) {
    return `Yesterday at ${timeString}`;
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
    return `${date.toLocaleDateString(undefined, dateOptions)} ${timeString}`;
  }
};

export const formatDateString = (isoString: string, format: string = "DD-MM-YYYY") => {
  return dayjs(isoString).format(format);
};
