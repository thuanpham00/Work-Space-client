import { forwardRef } from "react";
import { Avatar } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatMessageTime } from "../../utils/utils";
import styles from "./Messages.module.scss";
import type { Message } from "../../types/message.type";

interface Props {
  messages: Message[];
  pagination: {
    page: number;
    total_page: number;
  };
  fetchConversationDataMore: () => void;
}

const Messages = forwardRef<HTMLDivElement, Props>(
  ({ messages, pagination, fetchConversationDataMore }, ref) => {
    return (
      <div className={styles.messagesList} id="scrollableDiv">
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchConversationDataMore}
          style={{
            display: "flex",
            flexDirection: "column-reverse",
          }}
          inverse
          hasMore={pagination.page < pagination.total_page}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv"
        >
          {messages.map((msg, index) => {
            const nextMessage = messages[index + 1];
            const isSameUser = nextMessage?.sender?.id === msg.sender?.id;
            const isAttachments = msg.attachments && msg.attachments?.length > 0;

            if (isSameUser) {
              return (
                <div key={msg.id} className={styles.messageItemSameUser}>
                  <div className={styles.messageContentWrapper}>
                    {msg.content && <div className={styles.messageText}>{msg.content}</div>}
                    {isAttachments && (
                      <div className={styles.messageAttachments}>
                        {msg.attachments.map((attachment) =>
                          attachment.mimeType === "image/gif" || attachment.mimeType.startsWith("image/") ? (
                            <div key={attachment.id} className={styles.messageAttachment}>
                              <img
                                src={attachment.fileUrl}
                                alt={attachment.fileName}
                                className={styles.attachmentImg}
                              />
                            </div>
                          ) : null,
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={styles.messageItem}>
                <Avatar
                  src={msg.sender?.avatar}
                  alt={msg.sender?.displayName}
                  className={styles.messageAvatar}
                >
                  {msg.sender?.displayName.charAt(0)}
                </Avatar>

                <div className={styles.messageContentWrapper}>
                  <div className={styles.messageMeta}>
                    <span className={styles.messageSender}>{msg.sender?.displayName}</span>
                    <span className={styles.messageTime}>{formatMessageTime(msg.createdAt)}</span>
                  </div>

                  {msg.content && <div className={styles.messageText}>{msg.content}</div>}
                  {isAttachments && (
                    <div className={styles.messageAttachments}>
                      {msg.attachments.map((attachment) =>
                        attachment.mimeType === "image/gif" || attachment.mimeType.startsWith("image/") ? (
                          <div key={attachment.id} className={styles.messageAttachment}>
                            <img
                              src={attachment.fileUrl}
                              alt={attachment.fileName}
                              className={styles.attachmentImg}
                            />
                          </div>
                        ) : null,
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
    );
  },
);

Messages.displayName = "Messages";

export default Messages;
