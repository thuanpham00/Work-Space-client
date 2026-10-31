import { useCallback, useEffect, useRef } from "react";
import { useBaseStore } from "../store/baseStore";
import type { Message } from "../types/message.type";
import { queryClient } from "../main";
import { useChannelStore } from "../store/channelStore";
import { useUserStore } from "../store/userStore";

interface UseChannelSocketOptions {
  onMessage: (message: Message) => void;
}

/** Thời gian gom nhiều `mark_read` thành 1 lần gửi (ms). */
const MARK_READ_THROTTLE_MS = 800;

export function useChannelSocket({ onMessage }: UseChannelSocketOptions) {
  const socket = useBaseStore((state) => state.socket);
  const channelId = useChannelStore((state) => state.channelId);
  const workSpaceId = useChannelStore((state) => state.workSpaceId);
  const accessToken = useUserStore((state) => state.accessToken);
  const currentUserId = useUserStore((state) => state.user?.id);

  /**
   * Giữ callback mới nhất trong ref, KHÔNG đưa vào deps của useEffect.
   *
   * Lý do: parent (ChannelChat/DirectChat) tạo `onMessage` inline → mỗi lần
   * re-render sinh ra function mới. Nếu đưa vào deps → effect re-run mỗi lần
   * re-render → cleanup emit `leave_channel` rồi effect mới emit `join_channel`.
   * Mỗi lần nhận 1 tin nhắn cũng re-render → liên tục leave/join →
   * server reset read state + unread count liên tục → sai trạng thái đã đọc.
   */
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  /**
   * Throttle `mark_read`.
   *
   * Gửi `mark_read` cho TỪNG tin nhắn sẽ tạo 1 vòng DB write mỗi tin
   * (findUnique + upsert + count) → quá tải khi chat nhóm đông.
   * Gom nhiều tin trong 800ms thành 1 lần gửi (chỉ cần mốc đọc mới nhất).
   */
  const pendingReadRef = useRef<{ channelId: string; messageId: string } | null>(null);
  const readTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushMarkRead = useCallback(() => {
    if (readTimerRef.current) {
      clearTimeout(readTimerRef.current);
      readTimerRef.current = null;
    }
    const pending = pendingReadRef.current;
    pendingReadRef.current = null;
    if (!pending) return;

    const currentSocket = useBaseStore.getState().socket;
    if (!currentSocket?.connected) return;
    
    currentSocket.emit("mark_read", {
      channel_id: pending.channelId,
      message_id: pending.messageId,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (readTimerRef.current) {
        clearTimeout(readTimerRef.current);
        readTimerRef.current = null;
      }
    };
  }, []);

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

    const joinChannel = () => {
      socket.emit("join_channel", channelId);
    };

    const handleMessage = (message: Message) => {
      onMessageRef.current(message);

      // Tin tự gửi → server đã tự chốt read state + reset count → không cần gửi lại.
      if (currentUserId && message?.senderId === String(currentUserId)) return;
      if (!message?.id) return;

      // Báo server "user đã đọc message này".
      // → server chốt lastReadMessageId + reset unread count (nếu đây là tin mới nhất)
      // → đồng bộ badge cho các tab/thiết bị khác của cùng user.
      pendingReadRef.current = { channelId, messageId: message.id };

      if (!readTimerRef.current) {
        readTimerRef.current = setTimeout(() => {
          readTimerRef.current = null;
          flushMarkRead();
        }, MARK_READ_THROTTLE_MS);
      }
    };

    // coi chỗ này xử lý cập nhật state thay vì gọi api
    const handleChannelAttachmentsUpdated = () => {
      // queryClient.invalidateQueries({ queryKey: ["attachmentsChannel", channelId, query, accessToken] });
    };

    const handleRefreshChannelSettings = () => {
      queryClient.invalidateQueries({ queryKey: ["channelDetail", channelId, accessToken] });
    };

    const handleRefreshWorkspace = () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workSpaceId] });
    };

    if (socket.connected) joinChannel();

    // chưa kết nối thì lắng nghe sự kiện "connect" để join channel
    socket.on("connect", joinChannel);

    socket.on("receive_message", handleMessage);
    socket.on("receive_attachments", handleChannelAttachmentsUpdated);

    socket.on("channel_settings_updated", handleRefreshChannelSettings);
    socket.on("channel_nicknames_updated", handleRefreshChannelSettings);
    socket.on("channel_updated", handleRefreshWorkspace);

    return () => {
      socket.off("connect", joinChannel);

      socket.off("receive_message", handleMessage);
      socket.off("receive_attachments", handleChannelAttachmentsUpdated);

      socket.off("channel_settings_updated", handleRefreshChannelSettings);
      socket.off("channel_nicknames_updated", handleRefreshChannelSettings);
      socket.off("channel_updated", handleRefreshWorkspace);

      // Gửi nốt mốc đọc còn pending trước khi rời channel.
      flushMarkRead();

      if (socket.connected) {
        socket.emit("leave_channel", channelId);
      }
    };
  }, [socket, channelId, accessToken, workSpaceId, currentUserId, flushMarkRead]);
}
