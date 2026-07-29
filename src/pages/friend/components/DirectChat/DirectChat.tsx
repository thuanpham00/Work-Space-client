import { useState, useEffect, useContext } from "react";
import { Phone, Video, Pin, Search, AtSign } from "lucide-react";
import styles from "./DirectChat.module.scss";
import InfoUser from "../InfoUser/InfoUser";
import { FriendContext } from "../../FriendPage";
import { useQuery } from "react-query";
import { useAppStore } from "../../../../store/store";
import { channelApi } from "../../../../apis/channel.api";
import type { ChannelDM } from "../../../../types/channel.type";
import type { QueryBase } from "../../../../types/query.type";
import { type Message } from "../../../../types/message.type";
import { Spin } from "antd";
import Messages from "../../../../components/Messages/Messages";
import Composer from "../../../../components/Composer/Composer";

const PAGE = 1;
const LIMIT = 50;

export default function DirectChat() {
  const { selectFriendId, selectChannelId } = useContext(FriendContext);
  const accessToken = useAppStore((app) => app.accessToken);
  const socket = useAppStore((app) => app.socket);

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
    queryKey: ["channelDM", selectFriendId, accessToken],
    queryFn: () => channelApi.getDirectMessageChannelDetail(selectFriendId),
    enabled: Boolean(selectFriendId),
    staleTime: 60 * 1000 * 5,
  });
  const channelDMDetail = dataChannelDM?.data?.data?.channel as ChannelDM;
  const channelId = channelDMDetail?.id || selectChannelId;

  const { data: dataMessage } = useQuery({
    queryKey: ["messageChannel", channelId, query, accessToken],
    queryFn: () => channelApi.getMessagesChannel(channelId, query),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000 * 5,
  });

  const conversationListData = dataMessage?.data?.data?.messages as Message[];
  const page = dataMessage?.data?.data?.page;
  const total_page = dataMessage?.data?.data?.total_page;

  useEffect(() => {
    setMessages([]); // clear old messages
    setQuery({ page: PAGE, limit: LIMIT }); // reset pagination
    setPagination({ page: PAGE, total_page: 0 });
  }, [selectFriendId, selectChannelId]);

  useEffect(() => {
    if (!conversationListData) return;
    if (page === PAGE) setMessages(conversationListData);
    else setMessages((prev) => [...prev, ...conversationListData]);
    setPagination({ page, total_page });
  }, [conversationListData, page, total_page]);

  useEffect(() => {
    if (!socket || !channelId) return;

    socket.emit("join_channel", channelId); // join vào channel để cùng nhận socket

    return () => {
      socket.emit("leave_channel", channelId);
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
          <button className={styles.iconButton} title="Bắt đầu cuộc gọi thoại">
            <Phone size={20} />
          </button>
          <button className={styles.iconButton} title="Bắt đầu cuộc gọi video">
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
            messages={messages}
            pagination={pagination}
            fetchConversationDataMore={fetchConversationDataMore}
          />
          <Composer channelId={channelId} />
        </div>

        <InfoUser channelDMDetail={channelDMDetail} />
      </div>
    </div>
  );
}
