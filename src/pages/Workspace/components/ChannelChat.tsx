/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
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
import InfoChannel from "./InfoChannel/InfoChannel";
import type { ChannelMemberNickname, MemberChannel } from "../../../types/channel.type";
import type { Message } from "../../../types/message.type";
import { LIMIT, PAGE } from "../../../constants/config";
import type { Attachment } from "../../../types/attachment.type";
import { useChannelSocket } from "../../../Hooks/useChannelSocket";

export default function ChannelChat() {
  const channelId = useChannelStore((app) => app.channelId);
  const accessToken = useUserStore((app) => app.accessToken);
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

  const { data: dataChannel } = useQuery({
    queryKey: ["channelWorkspace", channelId, accessToken],
    queryFn: () => channelApi.getChannelDetail(channelId as string),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000 * 5,
  });

  const dataChannelDetail = dataChannel?.data?.data?.channel;
  const accentChannel = dataChannelDetail?.config?.accent;
  const backgroundUrlChannel = dataChannelDetail?.config?.backgroundUrl;
  const backgroundColorChannel = dataChannelDetail?.config?.backgroundColor;
  const nickNamesChannel = dataChannelDetail?.nicknames;
  const membersChannel = (dataChannelDetail?.members || []) as MemberChannel[];

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

  const attachmentsData = (dataAttachments?.data?.data?.attachments || []) as Attachment[];

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
    channelKind: "workspace",
    accessToken: accessToken as string,
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
            backgroundColorChannel={backgroundColorChannel as string}
            nickNames={nickNamesChannel as ChannelMemberNickname[]}
            attachments={attachmentsData}
            members={membersChannel}
          />
        </div>
      </div>
    </div>
  );
}
