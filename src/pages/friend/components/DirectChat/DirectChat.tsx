import React, { useState, useRef, useEffect, useContext } from "react";
import { Phone, Video, Pin, Search, PlusCircle, Gift, Smile, AtSign, Send, Sticker } from "lucide-react";
import styles from "./DirectChat.module.scss";
import InfoUser from "../InfoUser/InfoUser";
import { FriendContext } from "../../FriendPage";
import { useQuery } from "react-query";
import { useAppStore } from "../../../../store/store";
import { channelApi } from "../../../../apis/channel.api";
import type { ChannelDM } from "../../../../types/channel.type";
import type { QueryBase } from "../../../../types/query.type";
import { messageType, type Message } from "../../../../types/message.type";
import { Avatar } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatMessageTime } from "../../../../utils/utils";

const PAGE = 1;
const LIMIT = 10;

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
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (socket && channelId) {
      socket.emit("join_channel", channelId);
    }
  }, [socket, channelId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (msg: any) => {
      setMessages((prev) => [msg, ...prev]);
    });
    scrollToBottom();
    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setInputValue("");
    socket?.emit("send_message", {
      channel_id: channelId,
      content: inputValue,
      message_type: messageType.TEXT,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversationDataMore = () => {
    if (pagination.page < pagination.total_page) {
      setQuery({
        page: pagination.page + 1,
        limit: LIMIT,
      });
    }
  };

  if (!channelDMDetail) return;

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
          <div
            className={styles.messagesList}
            id="scrollableDiv"
            style={{
              overflow: "auto",
              display: "flex",
              flexDirection: "column-reverse",
            }}
          >
            <InfiniteScroll
              dataLength={messages.length}
              next={fetchConversationDataMore}
              style={{
                display: "flex",
                flexDirection: "column-reverse",
              }}
              inverse={true}
              hasMore={pagination.page < pagination.total_page}
              loader={<h4>Loading...</h4>}
              scrollableTarget="scrollableDiv"
            >
              {messages.map((msg) => {
                return (
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
                      {/* {msg.attachment && (
                      <div className={styles.messageAttachment}>
                        <img src={msg.attachment} alt="Attachment" className={styles.attachmentImg} />
                      </div>
                    )} */}
                    </div>
                  </div>
                );
              })}
            </InfiniteScroll>
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputForm}>
            <form onSubmit={handleSendMessage}>
              <div className={styles.inputContainer}>
                <button type="button" className={styles.inputPlusButton}>
                  <PlusCircle size={22} />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Nhắn @${channelDMDetail.friend.username}`}
                  className={styles.chatInput}
                />
                <div className={styles.inputActions}>
                  <button type="button" className={styles.actionBtn}>
                    <Gift size={20} />
                  </button>
                  <button type="button" className={styles.actionBtn}>
                    <Sticker size={20} />
                  </button>
                  <button type="button" className={styles.actionBtn}>
                    <Smile size={20} />
                  </button>
                  {inputValue.trim() && (
                    <button type="submit" className={styles.sendBtn}>
                      <Send size={18} />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        <InfoUser channelDMDetail={channelDMDetail} />
      </div>
    </div>
  );
}
