import EmojiPicker, { Theme } from "emoji-picker-react";
import { useAppStore } from "../../store/store";
import { forwardRef, type Dispatch, type SetStateAction } from "react";
import type { TypeDisplayMessage } from "../Composer/Composer";

interface EmojiMessageProps {
  setContent: Dispatch<SetStateAction<string>>;
  show: TypeDisplayMessage;
}

const EmojiMessage = forwardRef<HTMLDivElement, EmojiMessageProps>(({ setContent, show }, ref) => {
  const isDark = useAppStore((state) => state.isDarkMode);
  return (
    <div
      ref={ref}
      className={
        "transition-all ease-in-out duration-300 absolute right-0 -translate-y-[58%] " +
        (show === "emoji" ? "opacity-100" : "opacity-0")
      }
    >
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
});

EmojiMessage.displayName = "EmojiMessage";

export default EmojiMessage;
