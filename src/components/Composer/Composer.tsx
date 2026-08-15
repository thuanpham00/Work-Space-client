import { Smile, Send, FileChartColumn, Plus, UploadIcon, ChartNoAxesCombined } from "lucide-react";
import styles from "./Composer.module.scss";
import EmojiMessage from "../EmojiMessage/EmojiMessage";
import { useState, useRef, useEffect } from "react";
import { messageType, type MessageType, type TypeDisplayMessage } from "../../types/message.type";
import GifPicker from "../GiphyMesage/GiphyMessage";
import { AiOutlineGif } from "react-icons/ai";
import { useBaseStore } from "../../store/baseStore";
import { Button, Dropdown, type UploadFile } from "antd";
import UploadMutipleFile, { type UploadMultipleFile } from "../UploadMultipleFile/UploadMultipleFile";

export default function Composer({ channelId }: { channelId: string }) {
  const [inputValue, setInputValue] = useState("");
  const socket = useBaseStore((app) => app.socket);
  const [typeMessage, setTypeMessage] = useState<MessageType>(messageType.TEXT);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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

  const handleSendMessage = (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() && fileList.length === 0) return;

    socket?.emit("send_message", {
      channel_id: channelId,
      content: inputValue,
      message_type: typeMessage,
      files: fileList,
    });
    setInputValue("");
    setFileList([]);
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

  const items = [
    {
      key: "upload",
      label: "Tải Lên Tệp",
      icon: <UploadIcon size={14} />,
      onClick() {
        uploadRef.current?.handleClick(channelId);
      },
    },
    {
      key: "poll",
      label: "Tạo khảo sát",
      icon: <ChartNoAxesCombined size={14} />,
    },
  ];

  const uploadRef = useRef<UploadMultipleFile>(null);

  return (
    <div className={styles.inputForm}>
      <form onSubmit={handleSendMessage}>
        <div className={styles.inputContainer}>
          <UploadMutipleFile
            ref={uploadRef}
            onSubmit={setFileList}
            fileList={fileList}
            setFileList={setFileList}
          />

          <div className={styles.inputWrapper}>
            <Dropdown menu={{ items }} trigger={["click"]} placement="topLeft">
              <Button type="link" icon={<Plus />} />
            </Dropdown>

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
              {(inputValue.trim() || fileList.length > 0) && (
                <button type="submit" className={styles.sendBtn}>
                  <Send size={18} />
                </button>
              )}

              <EmojiMessage setContent={setInputValue} show={typeDisplayMessage} />

              <GifPicker show={typeDisplayMessage} onSubmit={handleSendGiphyMessage} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
