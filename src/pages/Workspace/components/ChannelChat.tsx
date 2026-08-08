/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState } from "react";
import { Phone, Video, Pin, Search, AtSign } from "lucide-react";
import styles from "./Channel.module.scss";
import Messages from "../../../components/Messages/Messages";
import Composer from "../../../components/Composer/Composer";
import type { QueryBase } from "../../../types/query.type";

const PAGE = 1;
const LIMIT = 50;

export default function ChannelChat() {
  const [query, setQuery] = useState<QueryBase>({
    limit: LIMIT,
    page: PAGE,
  });

  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0,
  });

  const fetchConversationDataMore = () => {
    if (pagination.page < pagination.total_page) {
      setQuery({
        page: pagination.page + 1,
        limit: LIMIT,
      });
    }
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <AtSign className={styles.atIcon} size={22} />
          <span className={styles.headerName}>Test Name</span>
          <span className={styles.statusIndicator}></span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.iconButton}
            title="Bắt đầu cuộc gọi thoại"
            // onClick={() => handleStartCall(false)}
          >
            <Phone size={20} />
          </button>
          <button
            className={styles.iconButton}
            title="Bắt đầu cuộc gọi video"
            // onClick={() => handleStartCall(true)}
          >
            <Video size={20} />
          </button>
          <button className={styles.iconButton} title="Tin nhắn đã ghim">
            <Pin size={20} />
          </button>

          <div className={styles.searchWrapper}>
            <input type="text" placeholder="Tìm kiếm" className={styles.searchInput} />
            <Search className={styles.searchIcon} size={15} />
          </div>
        </div>
      </header>

      <div className={styles.chatBody}>
        <div className={styles.messagesPane}>
          <Messages
            messages={[]}
            pagination={pagination}
            fetchConversationDataMore={fetchConversationDataMore}
          />
          <Composer channelId={"123"} />
        </div>
      </div>
    </div>
  );
}
