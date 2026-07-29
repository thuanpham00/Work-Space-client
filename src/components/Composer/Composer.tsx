import { Sticker, Smile, Send, Image } from "lucide-react";
import styles from "./Composer.module.scss";
import EmojiMessage from "../EmojiMessage/EmojiMessage";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../store/store";
import { messageType, type MessageType } from "../../types/message.type";
import GifPicker from "../GiphyMesage/GiphyMessage";
import { AiOutlineGif } from "react-icons/ai";

export type TypeDisplayMessage = "emoji" | "gif" | "sticker";

export default function Composer({ channelId }: { channelId: string }) {
  const [inputValue, setInputValue] = useState("");
  const socket = useAppStore((app) => app.socket);
  const [typeMessage, setTypeMessage] = useState<MessageType>(messageType.TEXT);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");

  const [typeDisplayMessage, setTypeDisplayMessage] = useState<TypeDisplayMessage | null>(null);
  const emojiWrapperRef = useRef<HTMLDivElement>(null);
  const giphyWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiWrapperRef.current && !emojiWrapperRef.current.contains(e.target as Node)) {
        setTypeDisplayMessage(null);
      }
    };
    if (typeDisplayMessage === "emoji") {
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

  console.log("typeDisplayMessage", typeDisplayMessage);

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
          <div className={styles.inputActions}>
            <button type="button" className={styles.actionBtn}>
              <Image size={20} />
            </button>
            <button
              type="button"
              className={styles.actionBtn}
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
              className={styles.actionBtn}
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
          </div>

          <EmojiMessage setContent={setInputValue} show={typeDisplayMessage} ref={emojiWrapperRef} />

          <GifPicker show={typeDisplayMessage} ref={giphyWrapperRef} />
        </div>
      </form>
    </div>
  );
}
