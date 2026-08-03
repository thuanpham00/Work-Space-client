import EmojiPicker, { Theme } from "emoji-picker-react";
import { type Dispatch, type SetStateAction } from "react";
import styles from "./EmojiMessage.module.scss";
import type { TypeDisplayMessage } from "../../types/message.type";
import { useBaseStore } from "../../store/baseStore";

interface EmojiMessageProps {
  setContent: Dispatch<SetStateAction<string>>;
  show: TypeDisplayMessage;
}

export default function EmojiMessage({ show, setContent }: EmojiMessageProps) {
  const isDark = useBaseStore((state) => state.isDarkMode);
  return (
    <div className={`${styles.emojiWrapper} ${show === "emoji" ? styles.show : styles.hide}`}>
      <EmojiPicker
        width={400}
        height={400}
        skinTonesDisabled
        lazyLoadEmojis
        theme={isDark ? Theme.DARK : Theme.LIGHT}
        onEmojiClick={(emojiData) => {
          setContent((prev: string) => prev + emojiData.emoji);
        }}
        previewConfig={{
          showPreview: false,
        }}
      />
    </div>
  );
}
