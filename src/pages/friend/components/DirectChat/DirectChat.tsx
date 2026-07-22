import React, { useState, useRef, useEffect } from "react";
import { Phone, Video, Pin, Search, PlusCircle, Gift, Smile, AtSign, Send, Sticker } from "lucide-react";
import styles from "./DirectChat.module.scss";
import InfoUser, { mockUser } from "../InfoUser/InfoUser";

const initialMessages = [
  {
    id: "msg-3",
    sender: {
      username: "hoang_son1999",
      displayName: "Hồ Hoàng Sơn",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    time: "3:01 CH",
    content: "có nhận thông báo này k em mới tag a vô",
    attachment: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop", // placeholder image representing screenshot
  },
];

export default function DirectChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: {
        username: "thuanphammm",
        displayName: "thuanphammm",
        avatar: "https://i.pravatar.cc/150?img=33",
      },
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      content: inputValue,
      attachment: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop",
    };

    setMessages([...messages, newMsg]);
    setInputValue("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <AtSign className={styles.atIcon} size={22} />
          <span className={styles.headerName}>{mockUser.displayName}</span>
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
          <div className={styles.messagesList}>
            {messages.map((msg) => {
              return (
                <div key={msg.id} className={styles.messageItem}>
                  <img
                    src={msg.sender.avatar}
                    alt={msg.sender.displayName}
                    className={styles.messageAvatar}
                  />
                  <div className={styles.messageContentWrapper}>
                    <div className={styles.messageMeta}>
                      <span className={styles.messageSender}>{msg.sender.displayName}</span>
                      <span className={styles.messageTime}>{msg.time}</span>
                    </div>
                    <div className={styles.messageText}>{msg.content}</div>
                    {msg.attachment && (
                      <div className={styles.messageAttachment}>
                        <img src={msg.attachment} alt="Attachment" className={styles.attachmentImg} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                  placeholder={`Nhắn @${mockUser.displayName}`}
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

        <InfoUser />
      </div>
    </div>
  );
}
