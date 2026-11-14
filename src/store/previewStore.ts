import { create } from "zustand";
import type { LastMessageType, Message } from "../types/message.type";

type PreviewStoreType = {
  previewByChannelId: Map<string, LastMessageType>;
  setPreviewFromMessage: (message: Message) => void;
};

export const usePreviewStore = create<PreviewStoreType>((set) => ({
  previewByChannelId: new Map<string, LastMessageType>(),

  setPreviewFromMessage: (message: Message) => {
    if (!message?.id || !message?.channelId) return;
    const channelId = String(message.channelId);
    const messageId = String(message.id);

    if (message.messageType === "CONFIG") return;

    set((state) => {
      const prev = state.previewByChannelId.get(channelId);
      if (prev?.id === messageId) return state;
      if (prev) {
        try {
          if (BigInt(messageId) <= BigInt(prev.id)) return state;
        } catch {
          // id không phải numeric string → so sánh createdAt fallback ở dưới.
          if (message.createdAt && prev.createdAt && message.createdAt <= prev.createdAt) return state;
        }
      }

      const sender = message.sender as Message["sender"] | undefined;
      const preview: LastMessageType = {
        id: messageId,
        channelId,
        senderId: String(message.senderId ?? sender?.id ?? ""),
        content: message.content ?? "",
        messageType: message.messageType ?? "TEXT",
        replyToId: String(message.replyToId ?? ""),
        createdAt: message.createdAt ?? new Date().toISOString(),
        updatedAt: message.updatedAt ?? message.createdAt ?? new Date().toISOString(),
        deletedAt: "",
        sender: {
          id: String(sender?.id ?? message.senderId ?? ""),
          username: sender?.username ?? "",
          displayName: sender?.displayName ?? "",
          avatar: sender?.avatar ?? "",
          status: (sender as unknown as { status?: string })?.status ?? "",
          fullName: sender?.fullName ?? sender?.displayName ?? "",
        },
      };

      const next = new Map(state.previewByChannelId);
      next.set(channelId, preview);
      return { previewByChannelId: next };
    });
  },
}));
