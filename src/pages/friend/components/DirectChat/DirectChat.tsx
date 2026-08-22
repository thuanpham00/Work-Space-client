/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Phone, Video, Pin, Search, AtSign, PanelRight } from "lucide-react";
import styles from "./DirectChat.module.scss";
import InfoUser from "../InfoUser/InfoUser";
import { useQuery } from "react-query";
import { channelApi } from "../../../../apis/channel.api";
import type { ChannelDM } from "../../../../types/channel.type";
import type { QueryBase } from "../../../../types/query.type";
import { type Message } from "../../../../types/message.type";
import Messages from "../../../../components/Messages/Messages";
import Composer from "../../../../components/Composer/Composer";
import { useUserStore } from "../../../../store/userStore";
import { useBaseStore } from "../../../../store/baseStore";
import { useChannelStore } from "../../../../store/channelStore";
import { Spin } from "antd";

const PAGE = 1;
const LIMIT = 50;

export default function DirectChat() {
  const accessToken = useUserStore((app) => app.accessToken);
  const socket = useBaseStore((app) => app.socket);
  const friendId = useChannelStore((app) => app.friendId);
  const channelId = useChannelStore((app) => app.channelId);
  const [showInfoPannel, setShowInfoPannel] = useState(true);

  const setChannelId = useChannelStore((app) => app.setChannelId);

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
    queryKey: ["channelDM", friendId, accessToken],
    queryFn: () => channelApi.getDirectMessageChannelDetail(friendId as string),
    enabled: Boolean(friendId),
    staleTime: 60 * 1000 * 5,
  });
  const channelDMDetail = dataChannelDM?.data?.data?.channel as ChannelDM;
  const backgroundUrlDM = channelDMDetail?.config?.backgroundUrl as string;
  const backgroundColorDM = channelDMDetail?.config?.backgroundColor as string;
  const accentDM = channelDMDetail?.config?.accent as string;

  useEffect(() => {
    if (channelDMDetail?.id && !channelId) {
      setChannelId(channelDMDetail.id);
    }
  }, [channelDMDetail?.id, channelId, setChannelId]);

  const { data: dataMessage } = useQuery({
    queryKey: ["messageChannel", channelId, query, accessToken],
    queryFn: () => channelApi.getMessagesChannel(channelId as string, query),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000 * 1,
  });

  const conversationListData = dataMessage?.data?.data?.messages as Message[];
  const page = dataMessage?.data?.data?.page as number;
  const total_page = dataMessage?.data?.data?.total_page as number;

  useEffect(() => {
    setMessages([]); // clear old messages
    setQuery({ page: PAGE, limit: LIMIT }); // reset pagination
    setPagination({ page: PAGE, total_page: 0 });
  }, [friendId, channelId]);

  useEffect(() => {
    if (!conversationListData) return;
    if (page === PAGE) setMessages(conversationListData);
    else setMessages((prev) => [...prev, ...conversationListData]);
    setPagination({ page, total_page });
  }, [conversationListData, page, total_page]);

  useEffect(() => {
    if (!socket || !channelId) return;

    const joinChannel = () => {
      socket.emit("join_channel", channelId);
    };

    if (socket.connected) {
      joinChannel(); // đã kết nối thì join channel
    }
    // chưa kết nối thì lắng nghe sự kiện "connect" để join channel
    socket.on("connect", joinChannel);

    return () => {
      socket.off("connect", joinChannel);
      if (socket.connected) {
        socket.emit("leave_channel", channelId);
      }
    };
  }, [socket, channelId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (msg: any) => {
      setMessages((prev) => [msg, ...prev]);
      setTimeout(scrollToBottom, 50); // Cuộn mượt về scrollTop = 0
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

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
          <AtSign className={styles.atIcon} size={22} />
          <span className={styles.headerName}>{channelDMDetail.friend.fullName}</span>
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
        <div
          className={styles.messagesPane}
          style={{
            backgroundImage: backgroundUrlDM ? `url(${backgroundUrlDM})` : undefined,
            backgroundColor: backgroundColorDM || undefined,
          }}
        >
          <Messages
            messages={messages}
            pagination={pagination}
            fetchConversationDataMore={fetchConversationDataMore}
            accentDM={accentDM}
          />
          <Composer channelId={channelId as string} />
        </div>

        <div className={`${styles.infoUser} ${showInfoPannel ? styles.showInfoUser : styles.hideInfoUser}`}>
          <InfoUser
            channelDMDetail={channelDMDetail}
            backgroundUrlDM={backgroundUrlDM}
            backgroundColorDM={backgroundColorDM}
            accentDM={accentDM}
          />
        </div>
      </div>
    </div>
  );
}
