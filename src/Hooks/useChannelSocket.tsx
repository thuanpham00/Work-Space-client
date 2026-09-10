import { useEffect } from "react";
import { useBaseStore } from "../store/baseStore";
import type { Message } from "../types/message.type";
import { queryClient } from "../main";
import { useChannelStore } from "../store/channelStore";
import { useUserStore } from "../store/userStore";

type ChannelKind = "dm" | "workspace";

interface UseChannelSocketOptions {
  channelKind: ChannelKind;
  onMessage: (message: Message) => void;
}

export function useChannelSocket({ onMessage, channelKind }: UseChannelSocketOptions) {
  const socket = useBaseStore((state) => state.socket);
  const channelId = useChannelStore((state) => state.channelId);
  const accessToken = useUserStore((state) => state.accessToken);

  /**
   * Thao tác gọi api để đồng bộ
   * - cập nhật biệt hiệu
   * - cập nhật cài đặt kênh
   *
   * Thao tác cập nhật state ko gọi api để tối ưu hiệu suất
   * - nhận tin nhắn mới
   * - nhận file mới
   */
  useEffect(() => {
    if (!socket || !channelId) return;

    const detailQueryKey = channelKind === "dm" ? "channelDM" : "channelWorkspace";

    const joinChannel = () => {
      socket.emit("join_channel", channelId);
    };

    const handleMessage = (message: Message) => {
      onMessage(message);
    };

    const handleChannelSettingsUpdated = () => {
      queryClient.invalidateQueries({ queryKey: [detailQueryKey, channelId, accessToken] });
    };

    // coi chỗ này xử lý cập nhật state thay vì gọi api
    const handleChannelAttachmentsUpdated = () => {
      // queryClient.invalidateQueries({ queryKey: ["attachmentsChannel", channelId, query, accessToken] });
    };

    if (socket.connected) joinChannel();

    // chưa kết nối thì lắng nghe sự kiện "connect" để join channel
    socket.on("connect", joinChannel);

    socket.on("receive_message", handleMessage);
    socket.on("receive_attachments", handleChannelAttachmentsUpdated);

    socket.on("channel_settings_updated", handleChannelSettingsUpdated);
    socket.on("channel_nicknames_updated", handleChannelSettingsUpdated);

    return () => {
      socket.off("connect", joinChannel);

      socket.off("receive_message", handleMessage);
      socket.off("receive_attachments", handleChannelAttachmentsUpdated);

      socket.off("channel_settings_updated", handleChannelSettingsUpdated);
      socket.off("channel_nicknames_updated", handleChannelSettingsUpdated);

      if (socket.connected) {
        socket.emit("leave_channel", channelId);
      }
    };
  }, [socket, channelId, accessToken, onMessage, channelKind]);
}
