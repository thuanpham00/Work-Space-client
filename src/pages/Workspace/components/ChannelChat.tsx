/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState } from "react";
import { Phone, Video, Pin, Search, Hash, Lock, PanelRight } from "lucide-react";
import styles from "./Channel.module.scss";
import Messages from "../../../components/Messages/Messages";
import Composer from "../../../components/Composer/Composer";
import type { QueryBase } from "../../../types/query.type";
import { useQuery } from "react-query";
import { useChannelStore } from "../../../store/channelStore";
import { useUserStore } from "../../../store/userStore";
import { channelApi } from "../../../apis/channel.api";
import { Spin } from "antd";
import InfoChannel from "./InfoChannel";

const PAGE = 1;
const LIMIT = 50;

interface WorkspaceProps {}

export default function ChannelChat({}: WorkspaceProps) {
  const channelId = useChannelStore((app) => app.channelId);
  const accessToken = useUserStore((app) => app.accessToken);
  const [showInfoPannel, setShowInfoPannel] = useState(true);

  const { data: dataChannel } = useQuery({
    queryKey: ["channelWorkspace", channelId, accessToken],
    queryFn: () => channelApi.getChannelDetail(channelId as string),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000 * 5,
  });

  const dataChannelDetail = dataChannel?.data?.data?.channel;

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

  if (!dataChannelDetail) {
    return (
      <div className={styles.loading}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          {dataChannelDetail.isPrivate ? (
            <Lock className={styles.atIcon} size={18} />
          ) : (
            <Hash className={styles.atIcon} size={18} />
          )}
          <span className={styles.headerName}>{dataChannelDetail.name}</span>
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

          <button
            className={`${styles.iconButton} ${showInfoPannel ? styles.active : ""}`}
            onClick={() => setShowInfoPannel(!showInfoPannel)}
          >
            <PanelRight size={20} />
          </button>
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

        <div
          className={`transition-all ease-linear overflow-hidden duration-300 ${showInfoPannel ? `opacity-100 w-[25%]` : "opacity-0 pointer-events-none w-0"}`}
        >
          <InfoChannel channelDetail={dataChannelDetail} />
        </div>
      </div>
    </div>
  );
}
