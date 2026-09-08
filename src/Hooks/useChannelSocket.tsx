import { useEffect } from "react";
import { useBaseStore } from "../store/baseStore";
import type { Message } from "../types/message.type";
import { queryClient } from "../main";
import type { QueryBase } from "../types/query.type";

type ChannelKind = "dm" | "workspace";

interface UseChannelSocketOptions {
  channelId: string;
  channelKind: ChannelKind;
  accessToken: string;
  query?: QueryBase;
  onMessage: (message: Message) => void;
}

export function useChannelSocket({
  channelId,
  accessToken,
  query,
  onMessage,
  channelKind,
}: UseChannelSocketOptions) {
  const socket = useBaseStore((state) => state.socket);

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

    const handleChannelAttachmentsUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["attachmentsChannel", channelId, query, accessToken] });
    };

    if (socket.connected) joinChannel();

    // chưa kết nối thì lắng nghe sự kiện "connect" để join channel
    socket.on("connect", joinChannel);
    socket.on("receive_message", handleMessage);
    socket.on("channel_settings_updated", handleChannelSettingsUpdated);
    socket.on("channel_nicknames_updated", handleChannelSettingsUpdated);
    socket.on("receive_attachments", handleChannelAttachmentsUpdated);

    return () => {
      socket.off("connect", joinChannel);
      socket.off("receive_message", handleMessage);
      socket.off("channel_settings_updated", handleChannelSettingsUpdated);
      socket.off("channel_nicknames_updated", handleChannelSettingsUpdated);
      socket.off("receive_attachments", handleChannelAttachmentsUpdated);

      if (socket.connected) {
        socket.emit("leave_channel", channelId);
      }
    };
  }, [socket, channelId, accessToken, query, onMessage, channelKind]);
}
