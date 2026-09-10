import { useState } from "react";
import { Phone, Video, Pin, Search, Hash, Lock, PanelRight } from "lucide-react";
import styles from "./Channel.module.scss";
import Messages from "../../../components/Messages/Messages";
import Composer from "../../../components/Composer/Composer";
import { useQuery } from "react-query";
import { useChannelStore } from "../../../store/channelStore";
import { useUserStore } from "../../../store/userStore";
import { channelApi } from "../../../apis/channel.api";
import { Spin } from "antd";
import InfoChannel from "./InfoChannel/InfoChannel";
import type { ChannelMemberNickname, MemberChannel } from "../../../types/channel.type";
import { useChannelSocket } from "../../../Hooks/useChannelSocket";
import useScrollMessage from "../../../Hooks/useScrollMessage";

export default function ChannelChat() {
  const channelId = useChannelStore((app) => app.channelId);
  const accessToken = useUserStore((app) => app.accessToken);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  const { data: dataChannel } = useQuery({
    queryKey: ["channelWorkspace", channelId, accessToken],
    queryFn: () => channelApi.getChannelDetail(channelId as string),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000 * 5,
  });

  const dataChannelDetail = dataChannel?.data?.data?.channel;
  const accentChannel = dataChannelDetail?.config?.accent;
  const backgroundUrlChannel = dataChannelDetail?.config?.backgroundUrl;
  const nickNamesChannel = dataChannelDetail?.nicknames;
  const membersChannel = (dataChannelDetail?.members || []) as MemberChannel[];

  const { messages, setMessages, fetchConversationDataMore, pagination, scrollToBottom } = useScrollMessage();

  useChannelSocket({
    channelKind: "workspace",
    onMessage: (message) => {
      setMessages((prev) => [message, ...prev]);
      setTimeout(scrollToBottom, 50);
    },
  });

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
          {dataChannelDetail.isDefault && <span>(Kênh mặc định)</span>}
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
            className={`${styles.iconButton} ${showInfoPanel ? styles.active : ""}`}
            onClick={() => setShowInfoPanel(!showInfoPanel)}
          >
            <PanelRight size={20} />
          </button>
        </div>
      </header>

      <div className={styles.chatBody}>
        <div className={styles.messagesPane}>
          <Messages
            messages={messages}
            pagination={pagination}
            fetchConversationDataMore={fetchConversationDataMore}
            accentDM={accentChannel as string}
            emptyState={{
              mode: "group",
              name: dataChannelDetail.name,
              subtitle: dataChannelDetail.description,
              isPrivate: dataChannelDetail.isPrivate,
            }}
          />
          <Composer channelId={channelId} />
        </div>

        <div
          className={`transition-all ease-linear overflow-hidden duration-300 ${showInfoPanel ? `opacity-100 w-[25%]` : "opacity-0 pointer-events-none w-0"}`}
        >
          <InfoChannel
            channelDetail={dataChannelDetail}
            accentChannel={accentChannel as string}
            backgroundUrlChannel={backgroundUrlChannel as string}
            nickNames={nickNamesChannel as ChannelMemberNickname[]}
            members={membersChannel}
          />
        </div>
      </div>
    </div>
  );
}
