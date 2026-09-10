/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { compareMessageTime, formatMessageTime } from "../../utils/utils";
import styles from "./Messages.module.scss";
import { messageType, type Message } from "../../types/message.type";
import { useUserStore } from "../../store/userStore";
import MessageAttachments from "../MessageAttachments/MessageAttachments";
import HeadChat, { type HeadChatProps } from "./HeadChat";
import MessageConfig from "./MessageConfig";
import type { UserType } from "../../types/user.type";
import AvatarFallback from "../AvatarFallback/AvatarFallback";

interface Props {
  messages: Message[];
  pagination: {
    page: number;
    total_page: number;
  };
  fetchConversationDataMore: () => void;
  accentDM: string;
  emptyState?: HeadChatProps;
}

const MESSAGES_SCROLLABLE_ID = "messagesScrollableDiv";

const Messages = forwardRef<HTMLDivElement, Props>(
  ({ messages, pagination, fetchConversationDataMore, accentDM, emptyState }, _) => {
    const user = useUserStore((state) => state.user);
    const hasMessages = messages.length > 0;
    const hasLoadedAllMessages = pagination.total_page > 0 && pagination.page >= pagination.total_page;
    const showChannelHead = Boolean(emptyState && (!hasMessages || hasLoadedAllMessages));

    return (
      <div
        className={`${styles.messagesList} ${!hasMessages ? styles.messagesListEmpty : ""}`}
        id={MESSAGES_SCROLLABLE_ID}
      >
        {!hasMessages && showChannelHead ? (
          <div className={styles.channelHead}>
            <HeadChat {...emptyState!} />
          </div>
        ) : (
          <InfiniteScroll
            dataLength={messages.length}
            next={fetchConversationDataMore}
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              width: "100%",
            }}
            inverse
            hasMore={pagination.page < pagination.total_page}
            loader={<div className={styles.loading}>Loading...</div>}
            scrollableTarget={MESSAGES_SCROLLABLE_ID}
          >
            {messages.map((msg, index) => {
              const nextMessage = messages[index + 1];
              const isSameUser = nextMessage?.sender?.id === msg.sender?.id;
              const hasAttachments = Boolean(msg.attachments?.length);
              const isMe = msg.sender?.id === user?.id;
              const isSameTime = compareMessageTime(msg.createdAt, nextMessage?.createdAt);

              const isMessageConfig = msg.messageType === messageType.CONFIG;

              if (isMessageConfig) {
                return (
                  <MessageConfig
                    key={msg.id}
                    config={JSON.parse(msg.content) as { action: string }}
                    sender={msg.sender as UserType}
                  />
                );
              }

              if (isSameUser && isSameTime) {
                return (
                  <div key={msg.id} className={styles.messageItemSameUser}>
                    <div className={styles.messageContentWrapper}>
                      {msg.content && (
                        <div
                          className={styles.messageText}
                          style={{ backgroundColor: isMe ? accentDM : "var(--color-bg-secondary)" }}
                        >
                          {msg.content}
                        </div>
                      )}
                      {hasAttachments && <MessageAttachments attachments={msg.attachments} />}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={styles.messageItem}>
                  <div className={styles.messageAvatar}>
                    <AvatarFallback
                      src={msg.sender?.avatar}
                      alt={msg.sender?.displayName}
                      size={40}
                      showStatus={false}
                    />
                  </div>

                  <div className={styles.messageContentWrapper}>
                    <div className={styles.messageMeta}>
                      <span className={styles.messageSender}>{isMe ? "Bạn" : msg.sender?.displayName}</span>

                      <span className={styles.messageTime}>{formatMessageTime(msg.createdAt)}</span>
                    </div>

                    {msg.content && (
                      <div
                        className={styles.messageText}
                        style={{
                          backgroundColor: isMe ? accentDM : "var(--color-bg-secondary)",
                          display: "inline-block",
                        }}
                      >
                        {msg.content}
                      </div>
                    )}

                    {hasAttachments && <MessageAttachments attachments={msg.attachments} />}
                  </div>
                </div>
              );
            })}

            {showChannelHead && (
              <div className={styles.channelHead}>
                <HeadChat {...emptyState!} />
              </div>
            )}
          </InfiniteScroll>
        )}
      </div>
    );
  },
);

Messages.displayName = "Messages";

export default Messages;
