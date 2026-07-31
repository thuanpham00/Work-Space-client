import { Smile, Send, FileChartColumn } from "lucide-react";
import styles from "./Composer.module.scss";
import EmojiMessage from "../EmojiMessage/EmojiMessage";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../store/store";
import { messageType, type MessageType, type TypeDisplayMessage } from "../../types/message.type";
import GifPicker from "../GiphyMesage/GiphyMessage";
import { AiOutlineGif } from "react-icons/ai";

export default function Composer({ channelId }: { channelId: string }) {
  const [inputValue, setInputValue] = useState("");
  const socket = useAppStore((app) => app.socket);
  const [typeMessage, setTypeMessage] = useState<MessageType>(messageType.TEXT);

  const [typeDisplayMessage, setTypeDisplayMessage] = useState<TypeDisplayMessage | null>(null);
  const actionBtnWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutsideButtons = actionBtnWrapperRef.current && !actionBtnWrapperRef.current.contains(target);

      if (isOutsideButtons) {
        setTypeDisplayMessage(null);
      }
    };

    if (typeDisplayMessage) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [typeDisplayMessage]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setInputValue("");
    socket?.emit("send_message", {
      channel_id: channelId,
      content: inputValue,
      message_type: typeMessage,
    });
  };

  const handleSendGiphyMessage = (gif: any) => {
    socket?.emit("send_gif", {
      channel_id: channelId,
      file_name: gif.title,
      file_url: gif.images.fixed_width.url,
      mime_type: "image/gif",
      file_size: gif.images.fixed_width.size,
    });
  };

  return (
    <div className={styles.inputForm}>
      <form onSubmit={handleSendMessage}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Nhắn `}
            className={styles.chatInput}
          />
          <div className={styles.inputActions} ref={actionBtnWrapperRef}>
            <button type="button" className={styles.actionBtn}>
              <FileChartColumn size={20} />
            </button>

            <button
              type="button"
              className={`${styles.actionBtn} ${typeDisplayMessage === "gif" ? styles.active : ""}`}
              onClick={() => {
                if (typeDisplayMessage === "gif") {
                  setTypeDisplayMessage(null);
                } else {
                  setTypeDisplayMessage("gif");
                }
              }}
            >
              <AiOutlineGif size={20} />
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${typeDisplayMessage === "emoji" ? styles.active : ""}`}
              onClick={() => {
                if (typeDisplayMessage === "emoji") {
                  setTypeDisplayMessage(null);
                } else {
                  setTypeDisplayMessage("emoji");
                }
              }}
            >
              <Smile size={20} />
            </button>
            {inputValue.trim() && (
              <button type="submit" className={styles.sendBtn}>
                <Send size={18} />
              </button>
            )}

            <EmojiMessage setContent={setInputValue} show={typeDisplayMessage} />

            <GifPicker show={typeDisplayMessage} onSubmit={handleSendGiphyMessage} />
          </div>
        </div>
      </form>
    </div>
  );
}
