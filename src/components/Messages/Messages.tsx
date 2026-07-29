import { forwardRef } from "react";
import { Avatar } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatMessageTime } from "../../utils/utils";
import type { Message } from "../../types/message.type";
import styles from "./Messages.module.scss";

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
          {messages.map((msg) => (
            <div key={msg.id} className={styles.messageItem}>
              <Avatar src={msg.sender?.avatar} alt={msg.sender?.displayName}>
                {msg.sender?.displayName.charAt(0)}
              </Avatar>

              <div className={styles.messageContentWrapper}>
                <div className={styles.messageMeta}>
                  <span className={styles.messageSender}>{msg.sender?.displayName}</span>
                  <span className={styles.messageTime}>{formatMessageTime(msg.createdAt)}</span>
                </div>

                <div className={styles.messageText}>{msg.content}</div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    );
  },
);

Messages.displayName = "Messages";

export default Messages;
