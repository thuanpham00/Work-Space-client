/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Phone, Video, Pin, Search, PanelRight } from "lucide-react";
import styles from "./DirectChat.module.scss";
import InfoUser from "../InfoUser/InfoUser";
import { useQuery } from "react-query";
import { channelApi } from "../../../../apis/channel.api";
import type { Channel, ChannelMemberNickname } from "../../../../types/channel.type";
import type { QueryBase } from "../../../../types/query.type";
import { type Message } from "../../../../types/message.type";
import Messages from "../../../../components/Messages/Messages";
import Composer from "../../../../components/Composer/Composer";
import { useUserStore } from "../../../../store/userStore";
import { useChannelStore } from "../../../../store/channelStore";
import { Spin } from "antd";
import type { Attachment } from "../../../../types/attachment.type";
import { LIMIT, PAGE } from "../../../../constants/config";
import { useChannelSocket } from "../../../../Hooks/useChannelSocket";

export default function DirectChat() {
  const accessToken = useUserStore((app) => app.accessToken);
  const channelId = useChannelStore((app) => app.channelId);
  const userId = useUserStore((app) => app.user?.id);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  const [query, setQuery] = useState<QueryBase>({
    limit: LIMIT,
    page: PAGE,
  });

  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0,
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const { data: dataChannelDM } = useQuery({
    queryKey: ["channelDM", channelId, accessToken],
    queryFn: () => channelApi.getChannelDetail(channelId as string),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000 * 5,
  });

  const channelDMDetail = dataChannelDM?.data?.data?.channel as Channel;
  const backgroundUrlDM = channelDMDetail?.config?.backgroundUrl as string;
  const accentDM = channelDMDetail?.config?.accent as string;
  const nickNames = channelDMDetail?.nicknames as ChannelMemberNickname[];

  const infoReceiver = channelDMDetail?.members?.find((member) => member.userId !== userId);
  const nickName = nickNames?.filter((nickname) => nickname.userId !== userId)[0]?.nickname;
  const displayName = nickName || infoReceiver?.fullName;

  const { data: dataMessage } = useQuery({
    queryKey: ["messageChannel", channelId, query, accessToken],
    queryFn: () => channelApi.getMessagesChannel(channelId as string, query),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000 * 1,
  });

  const conversationListData = dataMessage?.data?.data?.messages as Message[];
  const page = dataMessage?.data?.data?.page as number;
  const total_page = dataMessage?.data?.data?.total_page as number;

  const { data: dataAttachments } = useQuery({
    queryKey: ["attachmentsChannel", channelId, query, accessToken],
    queryFn: () => channelApi.getAttachmentsChannel(channelId as string, query),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000 * 1,
  });

  const attachmentsData = dataAttachments?.data?.data?.attachments as Attachment[];

  useEffect(() => {
    setMessages([]);
    setQuery({ page: PAGE, limit: LIMIT });
    setPagination({ page: PAGE, total_page: 0 });
  }, [channelId]);

  useEffect(() => {
    if (!conversationListData) return;
    if (page === PAGE) setMessages(conversationListData);
    else setMessages((prev) => [...prev, ...conversationListData]);
    setPagination({ page, total_page });
  }, [conversationListData, page, total_page]);

  const scrollToBottom = () => {
    const scrollableDiv = document.getElementById("scrollableDiv");
    if (scrollableDiv) {
      scrollableDiv.scrollTop = 0;
    }
  };

  const fetchConversationDataMore = () => {
    if (pagination.page < pagination.total_page) {
      setQuery({
        page: pagination.page + 1,
        limit: LIMIT,
      });
    }
  };

  useChannelSocket({
    channelId,
    channelKind: "dm",
    accessToken: accessToken as string,
    onMessage: (message) => {
      setMessages((prev) => [message, ...prev]);
      setTimeout(scrollToBottom, 50);
    },
  });

  if (!channelDMDetail)
    return (
      <div className={styles.loading}>
        <Spin size="large" tip="Loading..." />
      </div>
    );

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.headerName}>{displayName}</span>
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
            className={`${styles.iconButton} ${showInfoPanel ? styles.active : ""}`}
            onClick={() => setShowInfoPanel(!showInfoPanel)}
          >
            <PanelRight size={20} />
          </button>
        </div>
      </header>

      <div className={styles.chatBody}>
        <div
          className={styles.messagesPane}
          style={{
            backgroundImage: backgroundUrlDM
              ? `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(${backgroundUrlDM})`
              : undefined,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Messages
            messages={messages}
            pagination={pagination}
            fetchConversationDataMore={fetchConversationDataMore}
            accentDM={accentDM}
            emptyState={{
              mode: "dm",
              name: displayName || "",
              subtitle: infoReceiver?.username || "",
              avatar: infoReceiver?.avatar,
              status: infoReceiver?.status,
            }}
          />
          <Composer channelId={channelId as string} />
        </div>

        <div className={`${styles.infoUser} ${showInfoPanel ? styles.showInfoUser : styles.hideInfoUser}`}>
          <InfoUser
            channelDMDetail={channelDMDetail}
            backgroundUrlDM={backgroundUrlDM}
            accentDM={accentDM}
            nickNames={nickNames}
            attachments={attachmentsData}
          />
        </div>
      </div>
    </div>
  );
}
